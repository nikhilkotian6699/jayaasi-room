import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'audit.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
  const action = searchParams.get('action');

  const where = { hotelId: auth.hotelId };
  if (action) where.action = action;

  const logs = await prisma.userAuditLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, logs });
}
