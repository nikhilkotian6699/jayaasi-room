import { getAllRoomsWithActiveStays, getRoomByNumber, updateRoomStatus } from '@/lib/db/rooms';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';

export async function fetchHotelRooms(hotelId: string) {
  const rooms = await getAllRoomsWithActiveStays(hotelId);
  return rooms.map((r) => {
    const activeStay = r.stays[0];
    return {
      id: r.id,
      number: r.roomNumber,
      floor: r.floor,
      name: r.displayName,
      roomType: r.roomType.name,
      basePrice: Number(r.roomType.basePrice),
      status: r.status,
      housekeepingStatus: r.housekeepingStatus,
      guest: activeStay?.guest ? `${activeStay.guest.firstName} ${activeStay.guest.lastName}` : 'Vacant',
      checkOut: activeStay?.expectedCheckOutAt ? activeStay.expectedCheckOutAt.toISOString() : '—',
      folio: activeStay?.folio ? `₹${Number(activeStay.folio.grandTotal).toLocaleString('en-IN')}` : '₹0',
      activeRequests: activeStay?.serviceRequests?.length || 0,
    };
  });
}

export async function fetchRoomDetails(hotelId: string, roomNumber: string) {
  return getRoomByNumber(hotelId, roomNumber);
}

export async function changeRoomOperationalStatus(
  roomId: string,
  newStatus: RoomStatus,
  housekeepingStatus?: HousekeepingStatus
) {
  return updateRoomStatus(roomId, newStatus, housekeepingStatus);
}
