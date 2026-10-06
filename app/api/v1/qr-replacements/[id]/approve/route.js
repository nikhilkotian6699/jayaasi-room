import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { approveQrReplacement } from '@/lib/db/qr-management';

export async function POST(request, { params }) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'qr_replacement.approve' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const replacement = await approveQrReplacement(id, auth.user.id, body.notes, request);

    return NextResponse.json({ success: true, replacement });
  } catch (err) {
    console.error('[POST /api/v1/qr-replacements/[id]/approve]', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to approve replacement' }, { status: 500 });
  }
}
