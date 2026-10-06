/**
 * POST /api/v1/hotels/[hotelCode]/rooms/[roomCode]/session
 *
 * Core QR-scan session endpoint.
 *
 * Flow:
 *   1. Rate limit check (IP + room level)
 *   2. Resolve hotel by code
 *   3. Resolve room by (hotelId + roomCode)
 *   4. Validate room status (active, not maintenance/inactive)
 *   5. Validate active QR exists for room
 *   6. Get-or-create 60-second session (idempotent)
 *   7. Return session with expiry and remainingSeconds
 *
 * Response always uses UTC expiresAt; frontend converts to local display.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getOrCreateRoomSession,
  remainingSeconds,
  SESSION_DURATION_SECONDS,
} from '@/lib/db/room-sessions';
import { getActiveQrForRoom } from '@/lib/db/room-qr';
import {
  checkSessionRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { createHash } from 'crypto';

function hashIp(ip) {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'jayaasi-salt')).digest('hex').slice(0, 16);
}

export async function POST(request, { params }) {
  try {
    const { hotelCode, roomCode } = await params;

    // ── 1. Rate limit ────────────────────────────────────────────
    const clientIp = getClientIp(request);
    const preliminaryRoomId = `${hotelCode}:${roomCode}`; // used before DB lookup for rate limit
    const rateCheck = checkSessionRateLimit(clientIp, preliminaryRoomId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || 'RATE_LIMITED',
          message: 'Too many requests. Please try again shortly.',
          retryAfter: rateCheck.resetAfter,
        },
        { status: 429 }
      );
    }

    // ── 2. Resolve hotel ─────────────────────────────────────────
    const hotel = await prisma.hotel.findFirst({
      where: { code: hotelCode.toUpperCase(), active: true },
    });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'HOTEL_NOT_FOUND', message: 'Hotel not found.' },
        { status: 404 }
      );
    }

    // ── 3. Resolve room ──────────────────────────────────────────
    const room = await prisma.room.findFirst({
      where: {
        hotelId: hotel.id,
        roomNumber: roomCode,
        active: true,
      },
      include: { roomType: true },
    });
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'ROOM_NOT_FOUND', message: 'Room not found.' },
        { status: 404 }
      );
    }

    // ── 4. Validate room status ──────────────────────────────────
    if (room.status === 'OUT_OF_SERVICE' || room.status === 'MAINTENANCE') {
      return NextResponse.json(
        {
          success: false,
          error: 'ROOM_INACTIVE',
          message: 'This room is temporarily unavailable.',
        },
        { status: 403 }
      );
    }

    // ── 5. Validate QR ───────────────────────────────────────────
    const activeQr = await getActiveQrForRoom(room.id);
    if (!activeQr) {
      return NextResponse.json(
        { success: false, error: 'QR_DISABLED', message: 'No active QR for this room.' },
        { status: 403 }
      );
    }

    // ── 6. Get or create session ─────────────────────────────────
    const ipHash = hashIp(clientIp);
    const { session, token, isNew } = await getOrCreateRoomSession(
      room.id,
      hotel.id,
      ipHash
    );

    const secs = remainingSeconds(session.expiresAt);

    // ── 7. Respond ───────────────────────────────────────────────
    const responsePayload = {
      success: true,
      hotel: {
        code: hotel.code,
        name: hotel.name,
        timezone: hotel.timezone,
      },
      room: {
        id: room.id,
        number: room.roomNumber,
        floor: room.floor,
        type: room.roomType?.name || 'Standard',
        displayName: room.displayName,
      },
      session: {
        // Only return raw token on NEW session creation. For existing sessions,
        // token was already given to the client on first scan.
        ...(isNew && token ? { token } : {}),
        sessionId: session.id,
        expiresAt: session.expiresAt.toISOString(),
        remainingSeconds: secs,
        isNew,
        durationSeconds: SESSION_DURATION_SECONDS,
      },
    };

    return NextResponse.json(responsePayload, {
      status: isNew ? 201 : 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Session-Remaining': String(secs),
      },
    });
  } catch (error) {
    console.error('[POST /api/v1/hotels/.../session]', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * GET — Check session status without creating a new one.
 * Used by frontend to verify a token the client already holds.
 */
export async function GET(request, { params }) {
  try {
    const { hotelCode, roomCode } = await params;
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'NO_TOKEN', message: 'No session token provided.' },
        { status: 401 }
      );
    }

    const { validateRoomSessionToken } = await import('@/lib/db/room-sessions');
    const { valid, session, error } = await validateRoomSessionToken(token);

    if (!valid || !session) {
      return NextResponse.json(
        { success: false, error: error || 'INVALID_SESSION', message: 'Session is not valid.' },
        { status: 401 }
      );
    }

    // Cross-validate hotel + room match
    const hotel = await prisma.hotel.findFirst({ where: { code: hotelCode.toUpperCase() } });
    const room = hotel
      ? await prisma.room.findFirst({ where: { hotelId: hotel.id, roomNumber: roomCode } })
      : null;

    if (!room || session.roomId !== room.id) {
      return NextResponse.json(
        { success: false, error: 'SESSION_ROOM_MISMATCH', message: 'Session does not match this room.' },
        { status: 403 }
      );
    }

    const secs = remainingSeconds(session.expiresAt);
    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.id,
        expiresAt: session.expiresAt.toISOString(),
        remainingSeconds: secs,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('[GET /api/v1/hotels/.../session]', error);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
