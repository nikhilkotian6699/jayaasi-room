import { NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/db/rbac';
import { listActiveGuestSessions } from '@/lib/db/guest-tracking';
import { remainingSeconds } from '@/lib/db/room-sessions';

export async function GET(request) {
  const { auth, errorResponse } = await authorizeRequest(request, { requiredPermission: 'session.read' });
  if (errorResponse) {
    return NextResponse.json({ success: false, error: errorResponse.message }, { status: errorResponse.status });
  }

  const sessions = await listActiveGuestSessions(auth.hotelId);
  const mapped = sessions.map((s) => ({
    id: s.id,
    roomId: s.roomId,
    roomNumber: s.room.roomNumber,
    displayName: s.room.displayName,
    floor: s.room.floor,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    remainingSeconds: remainingSeconds(s.expiresAt),
    status: s.status,
  }));

  return NextResponse.json({ success: true, sessions: mapped });
}
