import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { reportQrDamage, listQrReplacements } from '@/lib/db/qr-management';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['qr_replacement.read', 'qr_replacement.create'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const replacements = await listQrReplacements(auth.hotelId, status || undefined);
  return NextResponse.json({ success: true, replacements });
}

export async function POST(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_replacement.create' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const body = await request.json();
    const { roomId, reason, description, photoUrl } = body;

    if (!roomId || !reason) {
      return NextResponse.json({ success: false, error: 'roomId and reason are required' }, { status: 400 });
    }

    const replacement = await reportQrDamage(
      {
        hotelId: auth.hotelId,
        roomId,
        reportedById: auth.user.id,
        reason,
        description,
        photoUrl,
      },
      request
    );

    return NextResponse.json({ success: true, replacement }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/v1/qr-replacements]', err);
    return NextResponse.json({ success: false, error: 'Failed to report QR damage' }, { status: 500 });
  }
}
