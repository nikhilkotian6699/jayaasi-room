import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { createQrOrder, listQrOrders, updateQrOrderStatus } from '@/lib/db/qr-management';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_inventory.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const orders = await listQrOrders(auth.hotelId);
  return NextResponse.json({ success: true, orders });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_inventory.update' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { quantity, qrBoxType, supplierName, deliveryAddress } = body;

    if (!quantity || !qrBoxType || !supplierName) {
      return NextResponse.json(
        { success: false, error: 'quantity, qrBoxType, and supplierName are required' },
        { status: 400 }
      );
    }

    const order = await createQrOrder(
      {
        hotelId: auth.hotelId,
        quantity: Number(quantity),
        qrBoxType,
        supplierName,
        deliveryAddress: deliveryAddress || 'Livinn Hotel Front Desk, Pune',
        createdById: auth.user.id,
      },
      request
    );

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/qr-orders]', err);
    return NextResponse.json({ success: false, error: 'Failed to create QR order' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_inventory.update' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId and status are required' }, { status: 400 });
    }

    const order = await updateQrOrderStatus(orderId, status, auth.user.id, request);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('[PATCH /api/v1/qr-orders]', err);
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}
