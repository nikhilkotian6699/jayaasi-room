import prisma from '@/lib/prisma';

export async function getHotelBySlug(slug: string = 'jayaasi-rooms') {
  return prisma.hotel.findUnique({
    where: { slug },
    include: {
      taxConfigs: {
        where: { active: true },
      },
    },
  });
}

export async function getHotelOverview(hotelId: string) {
  const [totalRooms, occupiedRooms, openRequests, totalFolioBalance] = await Promise.all([
    prisma.room.count({ where: { hotelId, active: true } }),
    prisma.room.count({ where: { hotelId, status: 'OCCUPIED', active: true } }),
    prisma.serviceRequest.count({ where: { hotelId, status: { not: 'COMPLETED' } } }),
    prisma.folio.aggregate({
      where: { hotelId, status: 'OPEN' },
      _sum: { grandTotal: true },
    }),
  ]);

  return {
    totalRooms,
    occupiedRooms,
    occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    openRequests,
    totalFolioRevenue: totalFolioBalance._sum.grandTotal || 0,
  };
}
