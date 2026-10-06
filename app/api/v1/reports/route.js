import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'report.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'SUMMARY';

  const [rooms, orders, tasks, replacements] = await Promise.all([
    prisma.room.findMany({ where: { hotelId: auth.hotelId } }),
    prisma.order.findMany({ where: { hotelId: auth.hotelId } }),
    prisma.task.findMany({ where: { hotelId: auth.hotelId } }),
    prisma.qrReplacement.findMany({ where: { hotelId: auth.hotelId } }),
  ]);

  return NextResponse.json({
    success: true,
    report: {
      type,
      generatedAt: new Date(),
      hotelId: auth.hotelId,
      totalRooms: rooms.length,
      totalOrders: orders.length,
      totalTasks: tasks.length,
      totalReplacements: replacements.length,
      revenueTotal: orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0),
    },
  });
}
