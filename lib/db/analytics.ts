/**
 * Jayaasi Technology — Comprehensive Hotel Analytics Engine
 */

import prisma from '@/lib/prisma';
import { RoomStatus, TaskStatus, QrReplacementStatus, QrStatus } from '@prisma/client';

export async function getOwnerDashboardAnalytics(hotelId: string) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    hotel,
    totalRooms,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    activeSessions,
    totalSessions24h,
    orders,
    tasks,
    qrReplacements,
    activeQrCount,
  ] = await Promise.all([
    prisma.hotel.findUnique({ where: { id: hotelId } }),
    prisma.room.count({ where: { hotelId, active: true } }),
    prisma.room.count({ where: { hotelId, active: true, status: RoomStatus.OCCUPIED } }),
    prisma.room.count({ where: { hotelId, active: true, status: RoomStatus.AVAILABLE } }),
    prisma.room.count({
      where: {
        hotelId,
        active: true,
        status: { in: [RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_SERVICE] },
      },
    }),
    prisma.roomSession.count({
      where: { hotelId, status: 'ACTIVE', expiresAt: { gt: now } },
    }),
    prisma.roomSession.count({
      where: { hotelId, createdAt: { gte: dayAgo } },
    }),
    prisma.order.findMany({
      where: { hotelId },
      include: { items: true },
    }),
    prisma.task.findMany({
      where: { hotelId },
      include: { assignee: true },
    }),
    prisma.qrReplacement.findMany({
      where: { hotelId },
    }),
    prisma.roomQrCode.count({
      where: { hotelId, status: QrStatus.ACTIVE },
    }),
  ]);

  // Financial aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Task metrics
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.ASSIGNED).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // QR Replacement metrics
  const reportedReplacements = qrReplacements.filter((r) => r.status === QrReplacementStatus.REPORTED).length;
  const installedReplacements = qrReplacements.filter((r) => r.status === QrReplacementStatus.INSTALLED).length;

  return {
    hotel: {
      id: hotel?.id,
      name: hotel?.name,
      code: hotel?.code,
      currency: hotel?.currency || 'INR',
    },
    rooms: {
      total: totalRooms,
      occupied: occupiedRooms,
      available: availableRooms,
      maintenance: maintenanceRooms,
      occupancyRate,
      activeQrs: activeQrCount,
    },
    traffic: {
      activeGuestSessions: activeSessions,
      scansLast24h: totalSessions24h,
    },
    business: {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    },
    operations: {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      taskCompletionRate,
    },
    qrHealth: {
      totalActive: activeQrCount,
      pendingReplacement: reportedReplacements,
      installedTotal: installedReplacements,
    },
  };
}
