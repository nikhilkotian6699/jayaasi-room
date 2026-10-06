/**
 * GET /api/v1/admin/rooms/[roomId]/sessions
 * List active sessions for a room (admin view).
 *
 * DELETE /api/v1/admin/rooms/[roomId]/sessions
 * Revoke a specific session (body: { sessionId })
 */
import { NextResponse } from 'next/server';
import { getActiveSessionsForRoom, revokeRoomSession } from '@/lib/db/room-sessions';

export async function GET(request, { params }) {
  try {
    const { roomId } = await params;
    const sessions = await getActiveSessionsForRoom(roomId);
    return NextResponse.json({ success: true, sessions });
  } catch (err) {
    console.error('[GET sessions]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'SESSION_ID_REQUIRED' }, { status: 400 });
    }
    await revokeRoomSession(sessionId);
    return NextResponse.json({ success: true, message: 'Session revoked.' });
  } catch (err) {
    console.error('[DELETE session]', err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
