import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { listGuestsWithMetrics } from '@/lib/db/guest-tracking';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'guest.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const data = await listGuestsWithMetrics(auth.hotelId);
  return NextResponse.json({ success: true, ...data });
}
