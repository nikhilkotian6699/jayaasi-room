import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'floor.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const floors = await prisma.floor.findMany({
    where: { hotelId: auth.hotelId },
    include: { rooms: { select: { id: true, roomNumber: true, displayName: true, status: true } } },
    orderBy: { displayOrder: 'asc' },
  });

  return NextResponse.json({ success: true, floors });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'floor.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { floorNumber, name, displayOrder } = await request.json();
    if (!floorNumber || !name) {
      return NextResponse.json({ success: false, error: 'floorNumber and name are required' }, { status: 400 });
    }

    const floor = await prisma.floor.create({
      data: {
        hotelId: auth.hotelId,
        floorNumber: String(floorNumber),
        name,
        displayOrder: displayOrder || 0,
        active: true,
      },
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'FLOOR_CREATED',
      resourceType: 'floor',
      resourceId: floor.id,
      newValue: { floorNumber, name },
      request,
    });

    return NextResponse.json({ success: true, floor }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/floors]', err);
    return NextResponse.json({ success: false, error: 'Failed to create floor' }, { status: 500 });
  }
}
