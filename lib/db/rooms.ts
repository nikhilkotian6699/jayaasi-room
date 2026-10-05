import prisma from '@/lib/prisma';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

export async function getAllRoomsWithActiveStays(hotelId: string) {
  return prisma.room.findMany({
    where: { hotelId, active: true },
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
    orderBy: [
      { floor: 'asc' },
      { roomNumber: 'asc' },
    ],
  });
}

export async function getRoomByNumber(hotelId: string, roomNumber: string) {
  return prisma.room.findUnique({
    where: {
      hotelId_roomNumber: {
        hotelId,
        roomNumber,
      },
    },
    include: {
      roomType: true,
      stays: {
        where: { status: 'CHECKED_IN' },
        include: {
          guest: true,
          folio: {
            include: {
              charges: {
                orderBy: { postedAt: 'desc' },
              },
            },
          },
        },
        take: 1,
      },
    },
  });
}

export async function updateRoomStatus(
  roomId: string,
  status: RoomStatus,
  housekeepingStatus?: HousekeepingStatus
) {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      status,
      ...(housekeepingStatus ? { housekeepingStatus } : {}),
    },
  });
}
