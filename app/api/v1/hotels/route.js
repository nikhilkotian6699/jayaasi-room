import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRequest, logAuditEvent } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'hotel.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const hotel = await prisma.hotel.findUnique({
    where: { id: auth.hotelId },
    include: {
      floors: { orderBy: { displayOrder: 'asc' } },
      roomTypes: true,
    },
  });

  return NextResponse.json({ success: true, hotel });
}

export async function PUT(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'hotel.update' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const existing = await prisma.hotel.findUnique({ where: { id: auth.hotelId } });

    const updated = await prisma.hotel.update({
      where: { id: auth.hotelId },
      data: {
        name: body.name ?? existing.name,
        address: body.address ?? existing.address,
        phone: body.phone ?? existing.phone,
        email: body.email ?? existing.email,
        timezone: body.timezone ?? existing.timezone,
        currency: body.currency ?? existing.currency,
      },
    });

    await logAuditEvent({
      hotelId: auth.hotelId,
      userId: auth.user.id,
      action: 'HOTEL_UPDATED',
      resourceType: 'hotel',
      resourceId: auth.hotelId,
      oldValue: existing,
      newValue: updated,
      request,
    });

    return NextResponse.json({ success: true, hotel: updated });
  } catch (err) {
    console.error('[PUT /api/v1/hotels]', err);
    return NextResponse.json({ success: false, error: 'Failed to update hotel' }, { status: 500 });
  }
}
