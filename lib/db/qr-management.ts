/**
 * Jayaasi Technology — QR Management, Damage Replacement Workflow & Inventory
 */

import prisma from '@/lib/prisma';
import { QrReplacementStatus, QrOrderStatus, QrStatus } from '@prisma/client';
import { generateRoomQr, getActiveQrForRoom, revokeRoomQr } from './room-qr';
import { logAuditEvent } from './rbac';

export async function reportQrDamage(
  input: {
    hotelId: string;
    roomId: string;
    reportedById: string;
    reason: string;
    description?: string;
    photoUrl?: string;
  },
  req?: Request
) {
  // Find current active QR for the room
  const currentQr = await getActiveQrForRoom(input.roomId);

  const replacement = await prisma.$transaction(async (tx) => {
    const rep = await tx.qrReplacement.create({
      data: {
        hotelId: input.hotelId,
        roomId: input.roomId,
        reportedById: input.reportedById,
        reason: input.reason,
        description: input.description || null,
        photoUrl: input.photoUrl || '/images/qr-damaged-sample.png',
        status: QrReplacementStatus.REPORTED,
        oldQrId: currentQr?.id || null,
      },
      include: {
        room: true,
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.qrReplacementHistory.create({
      data: {
        replacementId: rep.id,
        status: QrReplacementStatus.REPORTED,
        notes: `Damage reported: ${input.reason}`,
        changedById: input.reportedById,
      },
    });

    return rep;
  });

  await logAuditEvent({
    hotelId: input.hotelId,
    userId: input.reportedById,
    action: 'QR_DAMAGE_REPORTED',
    resourceType: 'qr_replacement',
    resourceId: replacement.id,
    newValue: { roomId: input.roomId, reason: input.reason },
    request: req,
  });

  return replacement;
}

export async function listQrReplacements(hotelId: string, status?: QrReplacementStatus) {
  return prisma.qrReplacement.findMany({
    where: {
      hotelId,
      ...(status ? { status } : {}),
    },
    include: {
      room: {
        include: { roomType: true },
      },
      reporter: { select: { id: true, name: true, email: true } },
      installer: { select: { id: true, name: true, email: true } },
      history: {
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveQrReplacement(id: string, userId: string, notes?: string, req?: Request) {
  const replacement = await prisma.qrReplacement.findUnique({
    where: { id },
    include: { room: true },
  });
  if (!replacement) throw new Error('Replacement request not found');

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.qrReplacement.update({
      where: { id },
      data: { status: QrReplacementStatus.APPROVED },
      include: {
        room: true,
        reporter: { select: { id: true, name: true } },
      },
    });

    await tx.qrReplacementHistory.create({
      data: {
        replacementId: id,
        status: QrReplacementStatus.APPROVED,
        notes: notes || 'Replacement approved by Owner Admin',
        changedById: userId,
      },
    });

    return res;
  });

  await logAuditEvent({
    hotelId: replacement.hotelId,
    userId,
    action: 'QR_REPLACEMENT_APPROVED',
    resourceType: 'qr_replacement',
    resourceId: id,
    newValue: { status: QrReplacementStatus.APPROVED, notes },
    request: req,
  });

  return updated;
}

export async function rejectQrReplacement(id: string, userId: string, notes?: string, req?: Request) {
  const replacement = await prisma.qrReplacement.findUnique({ where: { id } });
  if (!replacement) throw new Error('Replacement request not found');

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.qrReplacement.update({
      where: { id },
      data: { status: QrReplacementStatus.REJECTED },
      include: {
        room: true,
        reporter: { select: { id: true, name: true } },
      },
    });

    await tx.qrReplacementHistory.create({
      data: {
        replacementId: id,
        status: QrReplacementStatus.REJECTED,
        notes: notes || 'Replacement rejected by Owner Admin',
        changedById: userId,
      },
    });

    return res;
  });

  await logAuditEvent({
    hotelId: replacement.hotelId,
    userId,
    action: 'QR_REPLACEMENT_REJECTED',
    resourceType: 'qr_replacement',
    resourceId: id,
    newValue: { status: QrReplacementStatus.REJECTED, notes },
    request: req,
  });

  return updated;
}

/**
 * Install the replacement QR:
 * 1. Revoke the old room QR
 * 2. Generate and activate the new room QR
 * 3. Update replacement status to INSTALLED and mark closed
 * 4. Deduct inventory if stock available
 * 5. Write audit log entries
 */
export async function installReplacementQr(
  input: {
    replacementId: string;
    installedById: string;
    hotelId: string;
  },
  req?: Request
) {
  const replacement = await prisma.qrReplacement.findUnique({
    where: { id: input.replacementId },
    include: { room: true },
  });
  if (!replacement) throw new Error('Replacement request not found');

  // Generate new active QR for the room (this internally revokes the previous active QR)
  const newQr = await generateRoomQr(replacement.roomId, replacement.hotelId);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.qrReplacement.update({
      where: { id: input.replacementId },
      data: {
        status: QrReplacementStatus.INSTALLED,
        newQrId: newQr.id,
        installedById: input.installedById,
        installedAt: new Date(),
      },
      include: {
        room: true,
        installer: { select: { id: true, name: true } },
      },
    });

    await tx.qrReplacementHistory.create({
      data: {
        replacementId: input.replacementId,
        status: QrReplacementStatus.INSTALLED,
        notes: `New QR box ${newQr.qrPublicId} (v${newQr.qrVersion}) installed and activated. Old QR revoked.`,
        changedById: input.installedById,
      },
    });

    // Reduce inventory count by 1 if there is an available SKU
    const inventory = await tx.qrInventory.findFirst({
      where: { hotelId: replacement.hotelId, quantity: { gt: 0 } },
    });
    if (inventory) {
      await tx.qrInventory.update({
        where: { id: inventory.id },
        data: {
          quantity: { decrement: 1 },
          status: inventory.quantity - 1 <= inventory.minimumStock ? 'LOW_STOCK' : 'IN_STOCK',
        },
      });
    }

    return res;
  });

  await logAuditEvent({
    hotelId: replacement.hotelId,
    userId: input.installedById,
    action: 'QR_REPLACED',
    resourceType: 'qr_replacement',
    resourceId: replacement.id,
    newValue: {
      oldQrId: replacement.oldQrId,
      newQrId: newQr.id,
      newQrPublicId: newQr.qrPublicId,
      status: 'INSTALLED',
    },
    request: req,
  });

  return { replacement: updated, newQr };
}

// ─────────────────────────────────────────────────────────────
// QR ORDERS
// ─────────────────────────────────────────────────────────────

export async function createQrOrder(
  input: {
    hotelId: string;
    quantity: number;
    qrBoxType: string;
    supplierName: string;
    deliveryAddress: string;
    createdById: string;
  },
  req?: Request
) {
  const orderNumber = `QR-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const order = await prisma.qrOrder.create({
    data: {
      hotelId: input.hotelId,
      orderNumber,
      quantity: input.quantity,
      qrBoxType: input.qrBoxType,
      supplierName: input.supplierName,
      deliveryAddress: input.deliveryAddress,
      status: QrOrderStatus.ORDERED,
      createdById: input.createdById,
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  await logAuditEvent({
    hotelId: input.hotelId,
    userId: input.createdById,
    action: 'QR_ORDER_CREATED',
    resourceType: 'qr_order',
    resourceId: order.id,
    newValue: { orderNumber, quantity: input.quantity, type: input.qrBoxType },
    request: req,
  });

  return order;
}

export async function updateQrOrderStatus(orderId: string, status: QrOrderStatus, userId: string, req?: Request) {
  const order = await prisma.qrOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  const updated = await prisma.$transaction(async (tx) => {
    const ord = await tx.qrOrder.update({
      where: { id: orderId },
      data: { status },
      include: { creator: { select: { id: true, name: true } } },
    });

    // If delivered, add to inventory stock
    if (status === QrOrderStatus.DELIVERED) {
      const inventory = await tx.qrInventory.findFirst({
        where: { hotelId: order.hotelId, qrBoxType: order.qrBoxType },
      });
      if (inventory) {
        await tx.qrInventory.update({
          where: { id: inventory.id },
          data: {
            quantity: { increment: order.quantity },
            status: 'IN_STOCK',
          },
        });
      }
    }

    return ord;
  });

  await logAuditEvent({
    hotelId: order.hotelId,
    userId,
    action: 'QR_ORDER_UPDATED',
    resourceType: 'qr_order',
    resourceId: order.id,
    oldValue: { status: order.status },
    newValue: { status },
    request: req,
  });

  return updated;
}

export async function listQrOrders(hotelId: string) {
  return prisma.qrOrder.findMany({
    where: { hotelId },
    include: { creator: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// ─────────────────────────────────────────────────────────────
// QR INVENTORY
// ─────────────────────────────────────────────────────────────

export async function getQrInventoryStats(hotelId: string) {
  const [inventories, activeQrCount, damagedCount, orders] = await Promise.all([
    prisma.qrInventory.findMany({ where: { hotelId } }),
    prisma.roomQrCode.count({ where: { hotelId, status: QrStatus.ACTIVE } }),
    prisma.qrReplacement.count({
      where: {
        hotelId,
        status: { in: [QrReplacementStatus.REPORTED, QrReplacementStatus.UNDER_REVIEW, QrReplacementStatus.APPROVED] },
      },
    }),
    prisma.qrOrder.findMany({
      where: {
        hotelId,
        status: { notIn: [QrOrderStatus.DELIVERED, QrOrderStatus.CANCELLED] },
      },
    }),
  ]);

  const available = inventories.reduce((sum, item) => sum + item.quantity, 0);
  const minimumStock = inventories.reduce((sum, item) => sum + item.minimumStock, 15);
  const orderedCount = orders
    .filter((o) => o.status === QrOrderStatus.ORDERED || o.status === QrOrderStatus.CONFIRMED)
    .reduce((sum, o) => sum + o.quantity, 0);
  const inTransitCount = orders
    .filter((o) => o.status === QrOrderStatus.DISPATCHED || o.status === QrOrderStatus.IN_TRANSIT)
    .reduce((sum, o) => sum + o.quantity, 0);

  const lowStockAlert = available < minimumStock;

  return {
    available,
    assigned: activeQrCount,
    damaged: damagedCount,
    ordered: orderedCount,
    inTransit: inTransitCount,
    minimumStock,
    lowStockAlert,
    inventories,
  };
}

export async function listQrInventory(hotelId: string) {
  return prisma.qrInventory.findMany({
    where: { hotelId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function upsertQrInventoryItem(
  input: {
    hotelId: string;
    sku: string;
    qrBoxType: string;
    quantity: number;
    minimumStock?: number;
    supplierId?: string;
  },
  userId?: string,
  req?: Request
) {
  const status = input.quantity <= (input.minimumStock ?? 10) ? 'LOW_STOCK' : 'IN_STOCK';

  const inventory = await prisma.qrInventory.upsert({
    where: {
      hotelId_sku: {
        hotelId: input.hotelId,
        sku: input.sku,
      },
    },
    update: {
      quantity: input.quantity,
      qrBoxType: input.qrBoxType,
      minimumStock: input.minimumStock ?? 10,
      status,
      supplierId: input.supplierId,
    },
    create: {
      hotelId: input.hotelId,
      sku: input.sku,
      qrBoxType: input.qrBoxType,
      quantity: input.quantity,
      minimumStock: input.minimumStock ?? 10,
      supplierId: input.supplierId,
      status,
    },
  });

  if (userId) {
    await logAuditEvent({
      hotelId: input.hotelId,
      userId,
      action: 'QR_INVENTORY_UPDATED',
      resourceType: 'qr_inventory',
      resourceId: inventory.id,
      newValue: { sku: input.sku, quantity: input.quantity },
      request: req,
    });
  }

  return inventory;
}
