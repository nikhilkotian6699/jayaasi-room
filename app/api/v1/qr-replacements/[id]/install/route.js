import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { installReplacementQr } from '@/lib/db/qr-management';

export async function POST(request, { params }) {
  const { auth, errorResponse } = await authorizeRequest(request, {
    requiredAnyPermission: ['qr_replacement.approve', 'qr.create'],
  });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { id } = await params;
    const result = await installReplacementQr(
      {
        replacementId: id,
        installedById: auth.user.id,
        hotelId: auth.hotelId,
      },
      request
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[POST /api/v1/qr-replacements/[id]/install]', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to install replacement QR' }, { status: 500 });
  }
}
