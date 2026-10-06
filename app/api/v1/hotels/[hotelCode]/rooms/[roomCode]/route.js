/**
 * GET /api/v1/hotels/[hotelCode]/rooms/[roomCode]
 * Returns room info + QR status for display on QR landing page.
 */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveQrForRoom } from '@/lib/db/room-qr';

export async function GET(request, { params }) {
  try {
    const { hotelCode, roomCode } = await params;

    const hotel = await prisma.hotel.findFirst({
      where: { code: hotelCode.toUpperCase(), active: true },
    });
    if (!hotel) {
      return NextResponse.json({ success: false, error: 'HOTEL_NOT_FOUND' }, { status: 404 });
    }

    const room = await prisma.room.findFirst({
      where: { hotelId: hotel.id, roomNumber: roomCode, active: true },
      include: { roomType: true },
    });
    if (!room) {
      return NextResponse.json({ success: false, error: 'ROOM_NOT_FOUND' }, { status: 404 });
    }

    const activeQr = await getActiveQrForRoom(room.id);

    return NextResponse.json({
      success: true,
      hotel: { code: hotel.code, name: hotel.name, timezone: hotel.timezone },
      room: {
        id: room.id,
        number: room.roomNumber,
        floor: room.floor,
        displayName: room.displayName,
        type: room.roomType?.name || 'Standard',
        status: room.status,
        qrActive: !!activeQr,
      },
    });
  } catch (err) {
    console.error('[GET /api/v1/hotels/.../rooms/...]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
