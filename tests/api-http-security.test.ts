/**
 * Jayaasi Technology — Direct HTTP API Security & 403 Forbidden Rejection Tests
 * Tests live endpoints on http://localhost:3000
 */

import { PrismaClient } from '@prisma/client';
import { createAuthToken } from '../lib/db/rbac';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

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

async function runApiTests() {
  console.log('\n🌐 Live HTTP API RBAC & 403 Forbidden Enforcement Tests\n');

  try {
    const hotelA = await prisma.hotel.findUnique({ where: { slug: 'jayaasi-rooms' } });
    const hotelB = await prisma.hotel.findUnique({ where: { slug: 'emerald-bay' } });
    const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@livinn.com' } });
    const staffUser = await prisma.user.findUnique({ where: { email: 'sunita.housekeeping@jayaasi.com' } });

    if (!hotelA || !hotelB || !ownerUser || !staffUser) {
      throw new Error('Required seeded data missing');
    }

    const ownerToken = createAuthToken({
      userId: ownerUser.id,
      email: ownerUser.email,
      hotelId: hotelA.id,
      roleName: 'OWNER_ADMIN',
    });

    const staffToken = createAuthToken({
      userId: staffUser.id,
      email: staffUser.email,
      hotelId: hotelA.id,
      roleName: 'STAFF_ADMIN',
    });

    // ── 1. Owner Allowed Endpoints (200 OK) ───────────────────
    console.log('── 1. Owner Admin Access (Expecting 200 OK) ─────────────────');

    const resOwnerGuests = await fetch(`${BASE_URL}/api/v1/guests`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelA.id },
    });
    const guestsBody = await resOwnerGuests.text();
    assert(resOwnerGuests.status === 200, `GET /api/v1/guests allowed for Owner (status ${resOwnerGuests.status})`, guestsBody.slice(0, 300));

    const resOwnerAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resOwnerAnalytics.status === 200, `GET /api/v1/analytics allowed for Owner (status ${resOwnerAnalytics.status})`);

    const resOwnerStaff = await fetch(`${BASE_URL}/api/v1/staff`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resOwnerStaff.status === 200, `GET /api/v1/staff allowed for Owner (status ${resOwnerStaff.status})`);

    const resOwnerInventory = await fetch(`${BASE_URL}/api/v1/qr-inventory`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resOwnerInventory.status === 200, `GET /api/v1/qr-inventory allowed for Owner (status ${resOwnerInventory.status})`);

    const resOwnerAudit = await fetch(`${BASE_URL}/api/v1/audit`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resOwnerAudit.status === 200, `GET /api/v1/audit allowed for Owner (status ${resOwnerAudit.status})`);

    // ── 2. Staff Forbidden Endpoints (Must be 403 Forbidden!) ──
    console.log('\n── 2. Staff Admin Forbidden Endpoints (Must Return 403 Forbidden) ─');

    const resStaffGuests = await fetch(`${BASE_URL}/api/v1/guests`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffGuests.status === 403, `GET /api/v1/guests rejects Staff with 403 FORBIDDEN (got ${resStaffGuests.status})`);

    const resStaffAnalytics = await fetch(`${BASE_URL}/api/v1/analytics`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffAnalytics.status === 403, `GET /api/v1/analytics rejects Staff with 403 FORBIDDEN (got ${resStaffAnalytics.status})`);

    const resStaffStaff = await fetch(`${BASE_URL}/api/v1/staff`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffStaff.status === 403, `GET /api/v1/staff rejects Staff with 403 FORBIDDEN (got ${resStaffStaff.status})`);

    const resStaffInventory = await fetch(`${BASE_URL}/api/v1/qr-inventory`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffInventory.status === 403, `GET /api/v1/qr-inventory rejects Staff with 403 FORBIDDEN (got ${resStaffInventory.status})`);

    const resStaffAudit = await fetch(`${BASE_URL}/api/v1/audit`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffAudit.status === 403, `GET /api/v1/audit rejects Staff with 403 FORBIDDEN (got ${resStaffAudit.status})`);

    const resStaffRoles = await fetch(`${BASE_URL}/api/v1/roles`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffRoles.status === 403, `GET /api/v1/roles rejects Staff with 403 FORBIDDEN (got ${resStaffRoles.status})`);

    const resStaffReports = await fetch(`${BASE_URL}/api/v1/reports`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffReports.status === 403, `GET /api/v1/reports rejects Staff with 403 FORBIDDEN (got ${resStaffReports.status})`);

    // ── 3. Staff Allowed Operational Endpoints ────────────────
    console.log('\n── 3. Staff Operational Endpoints (Expecting 200 OK) ────────');

    const resStaffTasks = await fetch(`${BASE_URL}/api/v1/tasks`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffTasks.status === 200, `GET /api/v1/tasks allowed for Staff (status ${resStaffTasks.status})`);

    const resStaffRooms = await fetch(`${BASE_URL}/api/v1/rooms`, {
      headers: { Authorization: `Bearer ${staffToken}`, 'x-hotel-id': hotelA.id },
    });
    assert(resStaffRooms.status === 200, `GET /api/v1/rooms allowed for Staff (status ${resStaffRooms.status})`);

    // ── 4. Cross-Hotel Tenancy Rejection ───────────────────────
    console.log('\n── 4. Cross-Hotel Tenant Isolation (Must Return 403 Forbidden) ─');

    const resCrossTenant = await fetch(`${BASE_URL}/api/v1/rooms`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'x-hotel-id': hotelB.id },
    });
    assert(
      resCrossTenant.status === 403,
      `Hotel A Owner accessing Hotel B rooms returns 403 FORBIDDEN (got ${resCrossTenant.status})`
    );

    console.log(`\n📊 Live HTTP API Test Results: ${passCount} passed, ${failCount} failed\n`);
    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal API test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runApiTests();
