import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'order.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const isStaff = auth.role.name === 'STAFF_ADMIN';
  const department = auth.department;

  // Fetch orders with room and items
  const orders = await prisma.order.findMany({
    where: { hotelId: auth.hotelId },
    include: {
      room: { select: { roomNumber: true, displayName: true, floor: true } },
      items: true,
      serviceRequests: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Departmental filtering for staff
  let filtered = orders;
  if (isStaff && department) {
    if (department === 'KITCHEN') {
      // Kitchen only sees orders that contain food items
      filtered = orders.filter((o) =>
        o.items.some((i) => i.nameSnapshot.toLowerCase().includes('sandwich') ||
          i.nameSnapshot.toLowerCase().includes('tea') ||
          i.nameSnapshot.toLowerCase().includes('biryani') ||
          i.nameSnapshot.toLowerCase().includes('meal') ||
          i.nameSnapshot.toLowerCase().includes('espresso') ||
          i.nameSnapshot.toLowerCase().includes('curry'))
      );
    } else if (department === 'HOUSEKEEPING') {
      // Housekeeping sees orders with housekeeping service requests
      filtered = orders.filter((o) =>
        o.serviceRequests.some((sr) => sr.department === 'HOUSEKEEPING')
      );
    } else if (department === 'LAUNDRY') {
      filtered = orders.filter((o) =>
        o.serviceRequests.some((sr) => sr.department === 'LAUNDRY')
      );
    }
  }

  return NextResponse.json({
    success: true,
    orders: filtered.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      roomNumber: o.room?.roomNumber,
      roomDisplayName: o.room?.displayName,
      floor: o.room?.floor,
      status: o.status,
      grandTotal: o.grandTotal,
      notes: o.notes,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        name: i.nameSnapshot,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal,
      })),
    })),
  });
}

export async function PATCH(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'order.update' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId and status are required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing || existing.hotelId !== auth.hotelId) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'ORDER_UPDATED',
      resourceType: 'order',
      resourceId: orderId,
      oldValue: { status: existing.status },
      newValue: { status },
      request,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error('[PATCH /api/v1/orders]', err);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
