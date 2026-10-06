import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { getQrInventoryStats, upsertQrInventoryItem } from '@/lib/db/qr-management';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_inventory.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const stats = await getQrInventoryStats(auth.hotelId);
  return NextResponse.json({ success: true, ...stats });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['qr_inventory.create', 'qr_inventory.update'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { sku, qrBoxType, quantity, minimumStock, supplierId } = body;

    if (!sku || !qrBoxType || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'sku, qrBoxType, and quantity are required' },
        { status: 400 }
      );
    }

    const item = await upsertQrInventoryItem(
      {
        hotelId: auth.hotelId,
        sku,
        qrBoxType,
        quantity: Number(quantity),
        minimumStock: minimumStock !== undefined ? Number(minimumStock) : undefined,
        supplierId,
      },
      auth.user.id,
      request
    );

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/qr-inventory]', err);
    return NextResponse.json({ success: false, error: 'Failed to update inventory' }, { status: 500 });
  }
}
