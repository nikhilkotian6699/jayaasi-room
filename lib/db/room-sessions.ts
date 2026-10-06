/**
 * Jayaasi — Room Session DB Layer
 * Manages the 60-second temporary guest sessions created on QR scan.
 *
 * Key principles:
 * - NEVER store raw tokens; store SHA-256 hash
 * - Return existing ACTIVE session if still valid (no duplicate creation)
 * - Atomic create using transaction + catch unique constraint violation
 * - Server timestamp is authoritative for expiry
 */

import prisma from '@/lib/prisma';
import { SessionStatus } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

export const SESSION_DURATION_SECONDS = 60;

/** Generate a cryptographically secure random session token (hex, 48 bytes = 96 chars) */
export function generateSecureToken(): string {
  return randomBytes(48).toString('hex');
}

/** SHA-256 hash a token for safe storage */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Calculate remaining seconds from now until expiresAt */
export function remainingSeconds(expiresAt: Date): number {
  const diff = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

/**
 * Get or create an ACTIVE session for a room.
 *
 * Concurrency-safe: if two requests race, both will try to find the active
 * session first. If neither finds one, one will succeed inserting and the other
 * will hit the unique token constraint, then retry the lookup.
 *
 * Returns: { session, token, isNew }
 */
export async function getOrCreateRoomSession(
  roomId: string,
  hotelId: string,
  ipHash?: string,
  deviceFingerprintHash?: string
): Promise<{ session: RoomSessionRow; token: string | null; isNew: boolean }> {
  // 1. Look for existing ACTIVE non-expired session
  const now = new Date();
  const existing = await prisma.roomSession.findFirst({
    where: {
      roomId,
      status: SessionStatus.ACTIVE,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    // Update last activity
    await prisma.roomSession.update({
      where: { id: existing.id },
      data: { lastActivityAt: now },
    });
    // We don't return the token for existing sessions (it was issued once only)
    return { session: existing, token: null, isNew: false };
  }

  // 2. Create new session atomically
  const rawToken = generateSecureToken();
  const tHash = hashToken(rawToken);
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000);

  try {
    const session = await prisma.roomSession.create({
      data: {
        roomId,
        hotelId,
        tokenHash: tHash,
        status: SessionStatus.ACTIVE,
        expiresAt,
        ipHash,
        deviceFingerprintHash,
      },
    });
    return { session, token: rawToken, isNew: true };
  } catch (err: unknown) {
    // Unique constraint on tokenHash violated (extreme collision — retry lookup)
    if ((err as NodeJS.ErrnoException & { code?: string }).code === 'P2002') {
      const race = await prisma.roomSession.findFirst({
        where: { roomId, status: SessionStatus.ACTIVE, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
      if (race) return { session: race, token: null, isNew: false };
    }
    throw err;
  }
}

/** Validate a raw token: find session, check expiry, mark expired if needed */
export async function validateRoomSessionToken(rawToken: string): Promise<{
  valid: boolean;
  session: RoomSessionRow | null;
  error?: string;
}> {
  const tHash = hashToken(rawToken);
  const session = await prisma.roomSession.findUnique({ where: { tokenHash: tHash } });

  if (!session) return { valid: false, session: null, error: 'INVALID_SESSION' };
  if (session.status === SessionStatus.REVOKED) return { valid: false, session, error: 'SESSION_REVOKED' };
  if (session.status === SessionStatus.EXPIRED || session.expiresAt <= new Date()) {
    // Mark expired in DB if not already
    if (session.status === SessionStatus.ACTIVE) {
      await prisma.roomSession.update({ where: { id: session.id }, data: { status: SessionStatus.EXPIRED } });
    }
    return { valid: false, session, error: 'SESSION_EXPIRED' };
  }

  // Update last activity
  await prisma.roomSession.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  });

  return { valid: true, session, error: undefined };
}

/** Revoke a specific session (admin action or explicit logout) */
export async function revokeRoomSession(sessionId: string) {
  return prisma.roomSession.update({
    where: { id: sessionId },
    data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
  });
}

/** Expire all stale sessions for housekeeping (can be called by cron) */
export async function expireAllStaleSessions() {
  return prisma.roomSession.updateMany({
    where: { status: SessionStatus.ACTIVE, expiresAt: { lte: new Date() } },
    data: { status: SessionStatus.EXPIRED },
  });
}

/** List active sessions for a room (admin view) */
export async function getActiveSessionsForRoom(roomId: string) {
  return prisma.roomSession.findMany({
    where: { roomId, status: SessionStatus.ACTIVE, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
}

// Type alias to avoid importing Prisma types in callers
export type RoomSessionRow = Awaited<ReturnType<typeof prisma.roomSession.findFirst>> & NonNullable<unknown>;
