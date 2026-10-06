/**
 * POST /api/v1/admin/rooms/[roomId]/qr
 * Generate or regenerate QR for a room.
 *
 * GET /api/v1/admin/rooms/[roomId]/qr
 * Get QR history for a room.
 *
 * DELETE /api/v1/admin/rooms/[roomId]/qr
 * Revoke the active QR for a room.
 */
import { NextResponse } from 'next/server';
import { generateRoomQr, revokeRoomQr, listRoomQrHistory, getActiveQrForRoom } from '@/lib/db/room-qr';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomId } = await params;

    // Validate room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true, roomType: true },
    });
    if (!room) {
      return NextResponse.json({ success: false, error: 'ROOM_NOT_FOUND' }, { status: 404 });
    }

    const qr = await generateRoomQr(roomId, room.hotelId);

    // Build the permanent public URL that goes into the QR image
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jayaasi.com';
    const qrUrl = `${baseUrl}/h/${room.hotel.code}/r/${room.roomNumber}`;

    return NextResponse.json({
      success: true,
      qr: {
        id: qr.id,
        qrPublicId: qr.qrPublicId,
        qrVersion: qr.qrVersion,
        status: qr.status,
        qrUrl,
        generatedAt: qr.generatedAt,
      },
      room: {
        id: room.id,
        number: room.roomNumber,
        displayName: room.displayName,
        hotelCode: room.hotel.code,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/admin/rooms/[roomId]/qr]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { roomId } = await params;
    const history = await listRoomQrHistory(roomId);
    const active = await getActiveQrForRoom(roomId);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jayaasi.com';
    const qrUrl = room ? `${baseUrl}/h/${room.hotel.code}/r/${room.roomNumber}` : null;

    return NextResponse.json({ success: true, active, history, qrUrl });
  } catch (err) {
    console.error('[GET /api/v1/admin/rooms/[roomId]/qr]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { roomId } = await params;
    await revokeRoomQr(roomId);
    return NextResponse.json({ success: true, message: 'QR revoked.' });
  } catch (err) {
    console.error('[DELETE /api/v1/admin/rooms/[roomId]/qr]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
