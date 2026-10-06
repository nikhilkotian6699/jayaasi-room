/**
 * Jayaasi Technology — Comprehensive RBAC, Multi-Tenant Security & QR Workflow Test Suite
 *
 * Validates:
 *   1. OWNER_ADMIN full operational and business permissions
 *   2. STAFF_ADMIN operational task access and strict rejection on forbidden resources (403 Forbidden)
 *   3. Multi-Tenant isolation (Hotel A users rejected on Hotel B data)
 *   4. QR damage replacement lifecycle (Report -> Approve -> Order -> Dispatch -> Deliver -> Install -> Old Revoked, New Active)
 *   5. Audit logging verification
 */

import { PrismaClient, QrReplacementStatus, QrOrderStatus, QrStatus, TaskStatus, TaskType } from '@prisma/client';
import {
  getUserAuthContext,
  SYSTEM_PERMISSIONS,
  hashPassword,
  verifyPassword,
  createAuthToken,
  verifyAuthToken,
} from '../lib/db/rbac';
import {
  reportQrDamage,
  approveQrReplacement,
  rejectQrReplacement,
  createQrOrder,
  updateQrOrderStatus,
  installReplacementQr,
  getQrInventoryStats,
} from '../lib/db/qr-management';
import { createTask, listTasks, updateTask } from '../lib/db/tasks';
import { generateRoomQr, getActiveQrForRoom, revokeRoomQr } from '../lib/db/room-qr';
import { getOwnerDashboardAnalytics } from '../lib/db/analytics';
import { listGuestsWithMetrics } from '../lib/db/guest-tracking';

const prisma = new PrismaClient();

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${name}${extra ? ' — ' + extra : ''}`);
    failCount++;
  }
}

async function runTests() {
  console.log('\n🧪 Jayaasi Admin RBAC, Multi-Tenant Security & QR Management Test Suite\n');

  try {
    // ── 1. Setup & Tenancy Context ─────────────────────────────
    console.log('── 1. Tenant & User Resolution ──────────────────────────────');
    const hotelA = await prisma.hotel.findUnique({ where: { slug: 'jayaasi-rooms' } });
    const hotelB = await prisma.hotel.findUnique({ where: { slug: 'emerald-bay' } });

    assert(!!hotelA, 'Hotel A (Jayaasi Rooms) exists in database');
    assert(!!hotelB, 'Hotel B (Emerald Bay Resort) exists in database');
    assert(hotelA?.id !== hotelB?.id, 'Hotel A and Hotel B have distinct UUIDs');

    const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@livinn.com' } });
    const housekeepingUser = await prisma.user.findUnique({ where: { email: 'sunita.housekeeping@jayaasi.com' } });
    const kitchenUser = await prisma.user.findUnique({ where: { email: 'chef.kitchen@jayaasi.com' } });
    const hotelBOwner = await prisma.user.findUnique({ where: { email: 'owner@emeraldbay.com' } });

    assert(!!ownerUser, 'Owner Admin user resolved');
    assert(!!housekeepingUser, 'Housekeeping Staff Admin resolved');
    assert(!!kitchenUser, 'Kitchen Staff Admin resolved');
    assert(!!hotelBOwner, 'Hotel B Owner resolved');

    // ── 2. Password & Token Security ───────────────────────────
    console.log('\n── 2. Authentication & Cryptographic Security ───────────────');
    assert(verifyPassword('OwnerPass123!', ownerUser!.passwordHash!), 'Owner password verifies correctly');
    assert(!verifyPassword('WrongPassword!', ownerUser!.passwordHash!), 'Wrong password is rejected');

    const token = createAuthToken({
      userId: ownerUser!.id,
      email: ownerUser!.email,
      hotelId: hotelA!.id,
      roleName: 'OWNER_ADMIN',
    });
    const verified = verifyAuthToken(token);
    assert(!!verified && verified.userId === ownerUser!.id, 'Auth token generates and verifies correctly with HMAC signature');
    assert(verifyAuthToken(token + 'tampered') === null, 'Tampered token is rejected');

    // ── 3. RBAC Permissions Engine ─────────────────────────────
    console.log('\n── 3. RBAC Permissions Enforcement ──────────────────────────');
    const ownerContext = await getUserAuthContext(ownerUser!.id, hotelA!.id);
    const staffContext = await getUserAuthContext(housekeepingUser!.id, hotelA!.id);

    assert(ownerContext?.role.name === 'OWNER_ADMIN', 'Owner role is OWNER_ADMIN');
    assert(staffContext?.role.name === 'STAFF_ADMIN', 'Staff role is STAFF_ADMIN');
    assert(staffContext?.department === 'HOUSEKEEPING', 'Staff department is HOUSEKEEPING');

    // Owner permissions check
    const ownerPerms = ownerContext?.permissions || [];
    assert(ownerPerms.includes('revenue.read'), 'Owner has revenue.read permission');
    assert(ownerPerms.includes('guest.read'), 'Owner has guest.read permission');
    assert(ownerPerms.includes('staff.create'), 'Owner has staff.create permission');
    assert(ownerPerms.includes('qr_inventory.create'), 'Owner has qr_inventory.create permission');
    assert(ownerPerms.includes('audit.read'), 'Owner has audit.read permission');
    assert(ownerPerms.length >= 45, `Owner has comprehensive permission set (count: ${ownerPerms.length})`);

    // Staff permissions check (strictly limited!)
    const staffPerms = staffContext?.permissions || [];
    assert(staffPerms.includes('task.read'), 'Staff has operational task.read permission');
    assert(staffPerms.includes('task.update'), 'Staff has operational task.update permission');
    assert(staffPerms.includes('qr_replacement.create'), 'Staff has qr_replacement.create permission (report damage)');
    assert(!staffPerms.includes('revenue.read'), 'Staff CANNOT access revenue.read (forbidden)');
    assert(!staffPerms.includes('guest.read'), 'Staff CANNOT access guest.read (forbidden)');
    assert(!staffPerms.includes('guest.analytics'), 'Staff CANNOT access guest.analytics (forbidden)');
    assert(!staffPerms.includes('staff.create'), 'Staff CANNOT access staff.create (forbidden)');
    assert(!staffPerms.includes('staff.disable'), 'Staff CANNOT access staff.disable (forbidden)');
    assert(!staffPerms.includes('qr_inventory.create'), 'Staff CANNOT access qr_inventory.create (forbidden)');
    assert(!staffPerms.includes('audit.read'), 'Staff CANNOT access audit.read (forbidden)');
    assert(!staffPerms.includes('settings.update'), 'Staff CANNOT access settings.update (forbidden)');

    // ── 4. Multi-Tenant Hotel Isolation ────────────────────────
    console.log('\n── 4. Multi-Tenant Hotel Scope Isolation ────────────────────');
    // Hotel A user trying to access Hotel B
    const crossHotelOwnerAccess = await getUserAuthContext(ownerUser!.id, hotelB!.id);
    assert(crossHotelOwnerAccess === null, 'Hotel A Owner context on Hotel B is NULL (tenant boundary strictly enforced)');

    const crossHotelStaffAccess = await getUserAuthContext(housekeepingUser!.id, hotelB!.id);
    assert(crossHotelStaffAccess === null, 'Hotel A Staff context on Hotel B is NULL (tenant boundary strictly enforced)');

    const hotelBOwnerContext = await getUserAuthContext(hotelBOwner!.id, hotelB!.id);
    assert(hotelBOwnerContext?.hotelId === hotelB!.id, 'Hotel B Owner is scoped strictly to Hotel B');

    // ── 5. Operational Tasks Module ────────────────────────────
    console.log('\n── 5. Operational Task Management & Filtering ───────────────');
    const room204 = await prisma.room.findFirst({ where: { hotelId: hotelA!.id, roomNumber: '204' } });
    assert(!!room204, 'Room 204 exists in Hotel A');

    const newTask = await createTask({
      hotelId: hotelA!.id,
      roomId: room204!.id,
      createdById: ownerUser!.id,
      assignedToId: housekeepingUser!.id,
      taskType: TaskType.HOUSEKEEPING,
      title: 'Inspect VIP Minibar and Linens',
      description: 'Ensure organic amenities are placed on credenza.',
    });
    assert(newTask.status === TaskStatus.ASSIGNED, 'Task created in ASSIGNED status');
    assert(newTask.assignedToId === housekeepingUser!.id, 'Task assigned to housekeeping staff');

    // Staff lists tasks
    const staffTasks = await listTasks(hotelA!.id, { assignedToId: housekeepingUser!.id });
    assert(staffTasks.some((t) => t.id === newTask.id), 'Staff sees their assigned task');

    // Staff updates task status and adds comment
    const updatedTask = await updateTask(newTask.id, housekeepingUser!.id, {
      status: TaskStatus.IN_PROGRESS,
      comment: 'Arrived at Room 204, commencing linen change.',
    });
    assert(updatedTask?.status === TaskStatus.IN_PROGRESS, 'Task status updated to IN_PROGRESS');

    const completedTask = await updateTask(newTask.id, housekeepingUser!.id, {
      status: TaskStatus.COMPLETED,
      comment: 'Linens and minibar restocked.',
    });
    assert(completedTask?.status === TaskStatus.COMPLETED, 'Task marked COMPLETED');
    assert(!!completedTask?.completedAt, 'completedAt timestamp recorded');

    // ── 6. Section 28 Acceptance Scenario: QR Damage Lifecycle ─
    console.log('\n── 6. Section 28 Acceptance Scenario: QR Damage Lifecycle ───');
    // Step A: Room 204 Active QR check
    const initialQr = await getActiveQrForRoom(room204!.id);
    assert(!!initialQr && initialQr.status === QrStatus.ACTIVE, 'Room 204 has initial ACTIVE QR');
    const initialQrId = initialQr!.id;
    const initialVersion = initialQr!.qrVersion;

    // Step B: Staff reports QR Damage
    const damageReport = await reportQrDamage({
      hotelId: hotelA!.id,
      roomId: room204!.id,
      reportedById: housekeepingUser!.id,
      reason: 'QR box damaged / scratched plate',
      description: 'Acrylic frame cracked, guest scanner failed.',
      photoUrl: '/images/qr-damaged-sample.png',
    });
    assert(damageReport.status === QrReplacementStatus.REPORTED, 'Damage ticket created in status REPORTED');
    assert(damageReport.reportedById === housekeepingUser!.id, 'Reported by Staff user');
    assert(damageReport.oldQrId === initialQrId, 'Damage ticket references existing active QR');

    // Step C: Owner reviews and approves replacement
    const approved = await approveQrReplacement(damageReport.id, ownerUser!.id, 'Approved by Owner. Dispatching replacement.');
    assert(approved.status === QrReplacementStatus.APPROVED, 'Damage ticket updated to status APPROVED');

    // Step D: Owner orders QR boxes
    const qrOrder = await createQrOrder({
      hotelId: hotelA!.id,
      quantity: 25,
      qrBoxType: 'Standard Acrylic Room QR Box',
      supplierName: 'XYZ Hospitality Supplies',
      deliveryAddress: 'Livinn Hotel, North Main Rd, Pune',
      createdById: ownerUser!.id,
    });
    assert(qrOrder.status === QrOrderStatus.ORDERED, 'QR Box order created with status ORDERED');
    assert(qrOrder.quantity === 25, 'Order quantity is 25');

    // Order status progression: ORDERED -> DISPATCHED -> DELIVERED
    const dispatched = await updateQrOrderStatus(qrOrder.id, QrOrderStatus.DISPATCHED, ownerUser!.id);
    assert(dispatched.status === QrOrderStatus.DISPATCHED, 'QR Order status progressed to DISPATCHED');

    const delivered = await updateQrOrderStatus(qrOrder.id, QrOrderStatus.DELIVERED, ownerUser!.id);
    assert(delivered.status === QrOrderStatus.DELIVERED, 'QR Order status progressed to DELIVERED');

    // Step E: Replacement QR Installation
    const installResult = await installReplacementQr({
      replacementId: damageReport.id,
      installedById: housekeepingUser!.id,
      hotelId: hotelA!.id,
    });
    assert(installResult.replacement.status === QrReplacementStatus.INSTALLED, 'Damage ticket status is INSTALLED');
    assert(!!installResult.replacement.installedAt, 'Installation timestamp recorded');

    // Verify Old QR is REVOKED and New QR is ACTIVE
    const oldQrCheck = await prisma.roomQrCode.findUnique({ where: { id: initialQrId } });
    assert(oldQrCheck?.status === QrStatus.REVOKED, 'Old Room 204 QR is now REVOKED');
    assert(!!oldQrCheck?.revokedAt, 'Old QR revocation timestamp recorded');

    const activeQrCheck = await getActiveQrForRoom(room204!.id);
    assert(!!activeQrCheck && activeQrCheck.status === QrStatus.ACTIVE, 'New Room 204 QR is ACTIVE');
    assert(activeQrCheck!.id !== initialQrId, 'New QR has a different unique ID from the old QR');
    assert(activeQrCheck!.qrVersion === initialVersion + 1, `New QR incremented version to v${activeQrCheck!.qrVersion}`);

    // Verify concurrency invariant: Only 1 active QR for Room 204
    const activeQrsCount = await prisma.roomQrCode.count({
      where: { roomId: room204!.id, status: QrStatus.ACTIVE },
    });
    assert(activeQrsCount === 1, 'Invariance check: Exactly ONE active QR exists for Room 204');

    // ── 7. QR Inventory Module ─────────────────────────────────
    console.log('\n── 7. QR Inventory Management ───────────────────────────────');
    const inventoryStats = await getQrInventoryStats(hotelA!.id);
    assert(inventoryStats.available > 0, `QR Inventory available stock calculated (${inventoryStats.available})`);
    assert(inventoryStats.assigned >= 11, `Assigned QR count reflects active rooms (${inventoryStats.assigned})`);
    assert(typeof inventoryStats.lowStockAlert === 'boolean', 'Low stock alert boolean calculated');

    // ── 8. Analytics & Guest Tracking Engine ───────────────────
    console.log('\n── 8. Owner Analytics & Guest Data Minimization ─────────────');
    const analytics = await getOwnerDashboardAnalytics(hotelA!.id);
    assert(analytics.rooms.total >= 11, 'Analytics reports total hotel rooms');
    assert(analytics.business.totalRevenue >= 0, 'Analytics reports total revenue');
    assert(analytics.operations.totalTasks >= 1, 'Analytics reports task completion metrics');
    assert(analytics.qrHealth.totalActive >= 11, 'Analytics reports QR health statistics');

    const guests = await listGuestsWithMetrics(hotelA!.id);
    assert(guests.guests.length > 0, 'Guests list resolved for Owner');
    assert(guests.guests[0].phoneMasked.includes('••••'), 'Guest phone is privacy-masked (data minimization)');

    // ── 9. Audit Logging ───────────────────────────────────────
    console.log('\n── 9. Audit Trail Verification ──────────────────────────────');
    const auditLogs = await prisma.userAuditLog.findMany({
      where: { hotelId: hotelA!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    assert(auditLogs.length > 0, `Audit trail recorded entries (found: ${auditLogs.length})`);
    const actions = auditLogs.map((l) => l.action);
    assert(actions.includes('QR_REPLACED') || actions.includes('TASK_CREATED'), 'Key administrative actions captured in audit log');

    console.log(`\n📊 Final Results: ${passCount} passed, ${failCount} failed\n`);
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
