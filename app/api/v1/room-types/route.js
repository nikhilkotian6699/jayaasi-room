import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'room_type.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const roomTypes = await prisma.roomType.findMany({
    where: { hotelId: auth.hotelId, active: true },
    orderBy: { basePrice: 'asc' },
  });

  return NextResponse.json({ success: true, roomTypes });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'room_type.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { code, name, description, basePrice, maxAdults, maxChildren } = await request.json();
    if (!code || !name || !basePrice) {
      return NextResponse.json({ success: false, error: 'code, name, and basePrice are required' }, { status: 400 });
    }

    const roomType = await prisma.roomType.create({
      data: {
        hotelId: auth.hotelId,
        code,
        name,
        description: description || null,
        basePrice,
        maxAdults: maxAdults || 2,
        maxChildren: maxChildren || 1,
        active: true,
      },
    });

    return NextResponse.json({ success: true, roomType }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/room-types]', err);
    return NextResponse.json({ success: false, error: 'Failed to create room type' }, { status: 500 });
  }
}
