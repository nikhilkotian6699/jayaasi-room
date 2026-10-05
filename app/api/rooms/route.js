import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';
import { SUITE_ROOMS } from '@/lib/admin-data';

let runtimeRoomsStore = [...SUITE_ROOMS];

export async function GET() {
  try {
    const hotel = await prisma.hotel.findFirst();
    if (!hotel) {
      return NextResponse.json({ success: true, rooms: runtimeRoomsStore });
    }

    const dbRooms = await prisma.room.findMany({
      where: { hotelId: hotel.id, active: true },
      include: {
        roomType: true,
        stays: {
          where: { status: 'CHECKED_IN' },
          include: {
            guest: true,
            folio: true,
            serviceRequests: {
              where: { status: { not: 'COMPLETED' } },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    if (!dbRooms || dbRooms.length === 0) {
      return NextResponse.json({ success: true, rooms: runtimeRoomsStore });
    }

    const formattedRooms = dbRooms.map((r) => {
      const activeStay = r.stays[0];
      const fallback = SUITE_ROOMS.find((sr) => sr.number === r.roomNumber);

      let status = 'Available';
      if (r.status === 'OCCUPIED') status = 'Occupied';
      else if (r.status === 'CLEANING') status = 'Cleaning';
      else if (r.status === 'MAINTENANCE') status = 'Maintenance';

      let guest = 'Vacant';
      let checkOut = '—';
      let folio = '₹0';
      let activeRequests = 0;

      if (activeStay) {
        guest = `${activeStay.guest.firstName} ${activeStay.guest.lastName || ''}`.trim();
        checkOut = activeStay.expectedCheckOutAt
          ? new Date(activeStay.expectedCheckOutAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Today, 11:00 AM';
        folio = activeStay.folio ? `₹${Number(activeStay.folio.grandTotal).toLocaleString('en-IN')}` : '₹0';
        activeRequests = activeStay.serviceRequests.length;
      } else if (fallback) {
        guest = fallback.guest;
        checkOut = fallback.checkOut;
        folio = fallback.folio;
        activeRequests = fallback.activeRequests;
      }

      return {
        id: r.id,
        number: r.roomNumber,
        name: r.displayName || r.roomType?.name || fallback?.name || 'Suite Room',
        floor: r.floor || 'Floor 2',
        guest,
        status,
        checkOut,
        folio,
        activeRequests,
        hasInvoice: Boolean(activeStay?.folio || fallback?.hasInvoice),
        isGuestAppActive: r.roomNumber === '204',
      };
    });

    return NextResponse.json({ success: true, rooms: formattedRooms });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    return NextResponse.json({ success: true, rooms: runtimeRoomsStore });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { roomNumber, status, guest } = body;

    if (!roomNumber) {
      return NextResponse.json({ success: false, error: 'Room number required' }, { status: 400 });
    }

    try {
      const room = await prisma.room.findFirst({
        where: { roomNumber: String(roomNumber) },
      });

      if (room) {
        let prismaStatus = RoomStatus.AVAILABLE;
        let hkStatus = HousekeepingStatus.CLEAN;

        if (status === 'Occupied') {
          prismaStatus = RoomStatus.OCCUPIED;
          hkStatus = HousekeepingStatus.INSPECTED;
        } else if (status === 'Cleaning') {
          prismaStatus = RoomStatus.CLEANING;
          hkStatus = HousekeepingStatus.DIRTY;
        } else if (status === 'Maintenance') {
          prismaStatus = RoomStatus.MAINTENANCE;
        }

        await prisma.room.update({
          where: { id: room.id },
          data: {
            status: prismaStatus,
            housekeepingStatus: hkStatus,
          },
        });
      }
    } catch (e) {
      console.warn('DB patch error, updating runtime memory:', e.message);
    }

    runtimeRoomsStore = runtimeRoomsStore.map((r) => {
      if (r.number === String(roomNumber)) {
        return {
          ...r,
          status: status || r.status,
          guest: guest !== undefined ? guest : status === 'Available' || status === 'Cleaning' ? 'Vacant' : r.guest,
          folio: status === 'Available' ? '₹0' : r.folio,
        };
      }
      return r;
    });

    return NextResponse.json({ success: true, message: `Room ${roomNumber} updated` });
  } catch (error) {
    console.error('Error in PATCH /api/rooms:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
