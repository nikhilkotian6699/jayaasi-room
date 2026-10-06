import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request);
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  return NextResponse.json({
    success: true,
    user: auth.user,
    role: auth.role.name,
    hotelId: auth.hotelId,
    department: auth.department,
    permissions: auth.permissions,
  });
}
