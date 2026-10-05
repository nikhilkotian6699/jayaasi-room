import prisma from '@/lib/prisma';
import { RequestStatus, Department } from '@prisma/client';

export async function getLiveServiceRequests(
  hotelId: string,
  filter?: {
    roomId?: string;
    department?: Department;
    status?: RequestStatus;
  }
) {
  return prisma.serviceRequest.findMany({
    where: {
      hotelId,
      ...(filter?.roomId ? { roomId: filter.roomId } : {}),
      ...(filter?.department ? { department: filter.department } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
    include: {
      room: true,
      guest: true,
      order: {
        include: {
          items: true,
        },
      },
      assignedStaff: true,
    },
    orderBy: { requestedAt: 'desc' },
  });
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  assignedStaffId?: string
) {
  const updateData: Record<string, unknown> = { status };
  if (status === 'ACCEPTED' || status === 'IN_PROGRESS') {
    updateData.acceptedAt = new Date();
  }
  if (status === 'COMPLETED') {
    updateData.completedAt = new Date();
  }
  if (assignedStaffId) {
    updateData.assignedStaffId = assignedStaffId;
  }

  return prisma.serviceRequest.update({
    where: { id: requestId },
    data: updateData,
  });
}

export async function createLiveServiceRequest(params: {
  roomNumber: string;
  department?: Department;
  guestName?: string;
  notes?: string;
  items?: { name: string; qty: number; price: number }[];
  priority?: string;
  hotelId?: string;
}) {
  const hotel = params.hotelId
    ? await prisma.hotel.findUnique({ where: { id: params.hotelId } })
    : await prisma.hotel.findFirst();

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  // Find room by roomNumber
  const room = await prisma.room.findFirst({
    where: { hotelId: hotel.id, roomNumber: params.roomNumber },
    include: {
      stays: {
        where: { status: 'CHECKED_IN' },
        include: { guest: true, folio: true },
        take: 1,
      },
    },
  });

  if (!room) {
    throw new Error(`Room ${params.roomNumber} not found`);
  }

  let stay = room.stays[0];
  let guestId: string;

  if (stay) {
    guestId = stay.guestId;
  } else {
    // If room has no active checked-in stay, find or create guest
    const guest =
      (await prisma.guest.findFirst({
        where: {
          stays: { some: { roomId: room.id } },
        },
      })) ||
      (await prisma.guest.create({
        data: {
          firstName: params.guestName || `Guest of Room ${params.roomNumber}`,
          phone: '+91 99999 00000',
        },
      }));
    guestId = guest.id;

    // Create temporary stay so foreign key constraints are satisfied
    stay = await prisma.stay.create({
      data: {
        hotelId: hotel.id,
        roomId: room.id,
        guestId: guest.id,
        bookingReference: `BK-TEMP-${Date.now()}`,
        checkInAt: new Date(),
        status: 'CHECKED_IN',
      },
      include: { guest: true, folio: true },
    });
  }

  // Create Order if items are present
  let orderId: string | null = null;
  if (params.items && params.items.length > 0) {
    const subtotal = params.items.reduce(
      (acc, i) => acc + (i.price || 0) * (i.qty || 1),
      0
    );
    const taxTotal = subtotal * 0.05;
    const grandTotal = subtotal + taxTotal;

    const order = await prisma.order.create({
      data: {
        hotelId: hotel.id,
        stayId: stay.id,
        roomId: room.id,
        guestId: guestId,
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        subtotal,
        taxTotal,
        grandTotal,
        notes: params.notes || null,
        status: 'CONFIRMED',
        items: {
          create: params.items.map((i) => ({
            nameSnapshot: i.name,
            quantity: i.qty || 1,
            unitPrice: i.price || 0,
            taxRate: 5.0,
            taxAmount: (i.price || 0) * (i.qty || 1) * 0.05,
            lineTotal: (i.price || 0) * (i.qty || 1) * 1.05,
          })),
        },
      },
    });
    orderId = order.id;

    // Also post charge to folio if folio exists
    if (stay.folio && grandTotal > 0) {
      await prisma.folioCharge.create({
        data: {
          folioId: stay.folio.id,
          orderId: order.id,
          category: params.department || 'ROOM_SERVICE',
          description: params.items.map((i) => `${i.qty}x ${i.name}`).join(', '),
          quantity: 1,
          unitPrice: subtotal,
          subtotal,
          tax: taxTotal,
          total: grandTotal,
        },
      });

      await prisma.folio.update({
        where: { id: stay.folio.id },
        data: {
          subtotal: { increment: subtotal },
          taxTotal: { increment: taxTotal },
          grandTotal: { increment: grandTotal },
        },
      });
    }
  }

  const reqNumber = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

  return prisma.serviceRequest.create({
    data: {
      hotelId: hotel.id,
      stayId: stay.id,
      roomId: room.id,
      guestId: guestId,
      orderId,
      requestNumber: reqNumber,
      department: params.department || Department.KITCHEN,
      status: RequestStatus.NEW,
      priority: params.priority || 'NORMAL',
      notes:
        params.notes ||
        (params.items ? params.items.map((i) => `${i.qty}x ${i.name}`).join(', ') : ''),
    },
    include: {
      room: true,
      guest: true,
      order: {
        include: {
          items: true,
        },
      },
      assignedStaff: true,
    },
  });
}

