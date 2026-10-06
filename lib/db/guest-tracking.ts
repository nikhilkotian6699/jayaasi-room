/**
 * Jayaasi Technology — Guest Tracking & Activity Layer (with Data Minimization)
 */

import prisma from '@/lib/prisma';

export async function listGuestsWithMetrics(hotelId: string) {
  const stays = await prisma.stay.findMany({
    where: { hotelId },
    include: {
      guest: true,
      room: true,
      orders: {
        include: { items: true },
      },
      serviceRequests: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate by guest
  const guestMap = new Map<string, any>();

  for (const s of stays) {
    const gId = s.guestId;
    if (!guestMap.has(gId)) {
      guestMap.set(gId, {
        id: s.guest.id,
        // Privacy minimized format: e.g. "Rohan S."
        displayName: `${s.guest.firstName} ${s.guest.lastName ? s.guest.lastName[0] + '.' : ''}`,
        phoneMasked: s.guest.phone ? s.guest.phone.slice(0, 4) + '••••' + s.guest.phone.slice(-2) : '—',
        emailMasked: s.guest.email ? s.guest.email.replace(/(.{2})(.*)(@.*)/, '$1•••$3') : '—',
        vip: s.guest.vip,
        totalStays: 0,
        currentRoom: s.status === 'CHECKED_IN' ? s.room.roomNumber : null,
        lastSeenAt: s.sessions[0]?.lastSeenAt || s.createdAt,
        totalOrders: 0,
        totalSpent: 0,
        recentActivity: [],
      });
    }

    const rec = guestMap.get(gId);
    rec.totalStays += 1;
    rec.totalOrders += s.orders.length;
    rec.totalSpent += s.orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

    for (const ord of s.orders) {
      rec.recentActivity.push({
        type: 'ORDER',
        id: ord.id,
        summary: `Order #${ord.orderNumber} (₹${Number(ord.grandTotal).toLocaleString('en-IN')})`,
        time: ord.createdAt,
      });
    }
    for (const req of s.serviceRequests) {
      rec.recentActivity.push({
        type: 'REQUEST',
        id: req.id,
        summary: `Service #${req.requestNumber} (${req.department})`,
        time: req.requestedAt,
      });
    }
  }

  const list = Array.from(guestMap.values());
  const returningCount = list.filter((g) => g.totalStays > 1).length;

  return {
    guests: list,
    summary: {
      totalGuests: list.length,
      returningGuests: returningCount,
      retentionRate: list.length > 0 ? Math.round((returningCount / list.length) * 100) : 0,
    },
  };
}

export async function listActiveGuestSessions(hotelId: string) {
  const now = new Date();
  return prisma.roomSession.findMany({
    where: {
      hotelId,
      status: 'ACTIVE',
      expiresAt: { gt: now },
    },
    include: {
      room: {
        select: {
          id: true,
          roomNumber: true,
          displayName: true,
          floor: true,
        },
      },
    },
    orderBy: { expiresAt: 'desc' },
  });
}
