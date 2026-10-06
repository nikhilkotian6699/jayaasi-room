import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent } from '@/lib/db/rbac';
import { generateRoomQr } from '@/lib/db/room-qr';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'room.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const isOwner = auth.role.name === 'OWNER_ADMIN';

  const rooms = await prisma.room.findMany({
    where: { hotelId: auth.hotelId, active: true },
    include: {
      roomType: true,
      floorRef: true,
      roomQrCodes: {
        where: { status: 'ACTIVE' },
        orderBy: { qrVersion: 'desc' },
        take: 1,
      },
      tasks: {
        where: { status: { not: 'COMPLETED' } },
        include: { assignee: { select: { id: true, name: true } } },
      },
      qrReplacements: {
        where: { status: { notIn: ['INSTALLED', 'CLOSED', 'REJECTED'] } },
        take: 1,
      },
      // Only include full stays if Owner
      ...(isOwner
        ? {
            stays: {
              where: { status: 'CHECKED_IN' },
              include: { guest: true },
              take: 1,
            },
          }
        : {}),
    },
    orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jayaasi.com';

  const mapped = rooms.map((r) => {
    const activeQr = r.roomQrCodes[0];
    const damagedTicket = r.qrReplacements[0];
    const currentStay = isOwner && r.stays?.[0];

    const baseData = {
      id: r.id,
      roomNumber: r.roomNumber,
      displayName: r.displayName,
      floor: r.floor,
      status: r.status,
      housekeepingStatus: r.housekeepingStatus,
      roomType: {
        id: r.roomType.id,
        name: r.roomType.name,
        code: r.roomType.code,
      },
      activeQr: activeQr
        ? {
            id: activeQr.id,
            qrPublicId: activeQr.qrPublicId,
            version: activeQr.qrVersion,
            status: activeQr.status,
            url: `${baseUrl}/h/${auth.hotelId}/r/${r.roomNumber}`,
          }
        : null,
      qrDamageStatus: damagedTicket ? damagedTicket.status : null,
      activeTasks: r.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.taskType,
        assigneeName: t.assignee?.name,
      })),
    };

    // Owner gets sensitive business details (occupant, rate)
    if (isOwner) {
      return {
        ...baseData,
        currentGuest: currentStay
          ? {
              name: `${currentStay.guest.firstName} ${currentStay.guest.lastName}`,
              vip: currentStay.guest.vip,
              bookingRef: currentStay.bookingReference,
              checkIn: currentStay.checkInAt,
            }
          : null,
        basePrice: r.roomType.basePrice,
      };
    }

    return baseData;
  });

  return NextResponse.json({ success: true, rooms: mapped });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'room.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { roomNumber, displayName, roomTypeId, floor, floorId } = body;

    if (!roomNumber || !displayName || !roomTypeId) {
      return NextResponse.json(
        { success: false, error: 'roomNumber, displayName, and roomTypeId are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        hotelId: auth.hotelId,
        roomNumber: String(roomNumber),
        displayName,
        roomTypeId,
        floor: floor || 'Floor 1',
        floorId: floorId || null,
        status: 'AVAILABLE',
        housekeepingStatus: 'CLEAN',
        active: true,
      },
      include: { roomType: true },
    });

    // Automatically generate first permanent QR code for the room
    const qr = await generateRoomQr(room.id, auth.hotelId);

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'ROOM_CREATED',
      resourceType: 'room',
      resourceId: room.id,
      newValue: { roomNumber: room.roomNumber, displayName: room.displayName, qrId: qr.id },
      request,
    });

    return NextResponse.json({ success: true, room, qr }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/rooms]', err);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['room.update', 'room_status.update'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { roomId, status, housekeepingStatus, displayName, floorId } = body;

    if (!roomId) {
      return NextResponse.json({ success: false, error: 'roomId is required' }, { status: 400 });
    }

    const existing = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!existing || existing.hotelId !== auth.hotelId) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        status: status ?? existing.status,
        housekeepingStatus: housekeepingStatus ?? existing.housekeepingStatus,
        displayName: displayName ?? existing.displayName,
        floorId: floorId ?? existing.floorId,
      },
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'ROOM_UPDATED',
      resourceType: 'room',
      resourceId: roomId,
      oldValue: existing,
      newValue: updated,
      request,
    });

    return NextResponse.json({ success: true, room: updated });
  } catch (err) {
    console.error('[PATCH /api/v1/rooms]', err);
    return NextResponse.json({ success: false, error: 'Failed to update room' }, { status: 500 });
  }
}
