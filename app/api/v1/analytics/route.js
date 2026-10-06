import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { getOwnerDashboardAnalytics } from '@/lib/db/analytics';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'analytics.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const analytics = await getOwnerDashboardAnalytics(auth.hotelId);
  return NextResponse.json({ success: true, analytics });
}
