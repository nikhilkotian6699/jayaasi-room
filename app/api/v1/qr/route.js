import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent } from '@/lib/db/rbac';
import { generateRoomQr, revokeRoomQr } from '@/lib/db/room-qr';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  const where = { hotelId: auth.hotelId };
  if (roomId) where.roomId = roomId;

  const qrs = await prisma.roomQrCode.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          roomNumber: true,
          displayName: true,
          floor: true,
          status: true,
        },
      },
    },
    orderBy: [{ roomId: 'asc' }, { qrVersion: 'desc' }],
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jayaasi.com';

  const mapped = qrs.map((q) => ({
    id: q.id,
    roomId: q.roomId,
    roomNumber: q.room?.roomNumber,
    displayName: q.room?.displayName,
    floor: q.room?.floor,
    qrPublicId: q.qrPublicId,
    version: q.qrVersion,
    status: q.status,
    generatedAt: q.generatedAt,
    revokedAt: q.revokedAt,
    qrUrl: `${baseUrl}/h/${auth.hotelId}/r/${q.room?.roomNumber}`,
  }));

  return NextResponse.json({ success: true, qrs: mapped });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['qr.create', 'qr.regenerate'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { roomId } = await request.json();
    if (!roomId) {
      return NextResponse.json({ success: false, error: 'roomId is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    if (!room || room.hotelId !== auth.hotelId) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const qr = await generateRoomQr(roomId, auth.hotelId);

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: qr.qrVersion > 1 ? 'QR_REPLACED' : 'QR_CREATED',
      resourceType: 'qr',
      resourceId: qr.id,
      newValue: { roomId, qrPublicId: qr.qrPublicId, version: qr.qrVersion },
      request,
    });

    return NextResponse.json({ success: true, qr }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/qr]', err);
    return NextResponse.json({ success: false, error: 'Failed to generate QR' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr.revoke' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ success: false, error: 'roomId is required' }, { status: 400 });
    }

    await revokeRoomQr(roomId);

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'QR_REVOKED',
      resourceType: 'qr',
      resourceId: roomId,
      newValue: { roomId, status: 'REVOKED' },
      request,
    });

    return NextResponse.json({ success: true, message: 'QR revoked successfully' });
  } catch (err) {
    console.error('[DELETE /api/v1/qr]', err);
    return NextResponse.json({ success: false, error: 'Failed to revoke QR' }, { status: 500 });
  }
}
