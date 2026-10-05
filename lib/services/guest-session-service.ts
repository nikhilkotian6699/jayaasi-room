import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function createGuestSessionFromQR(
  hotelId: string,
  stayId: string,
  roomId: string,
  guestId: string
) {
  // Generate a cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Session lasts 48 hours or until checkout
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const session = await prisma.guestSession.create({
    data: {
      hotelId,
      stayId,
      roomId,
      guestId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    sessionId: session.id,
    token: rawToken, // Provided once to the client for cookie/localStorage storage
    expiresAt,
  };
}

export async function validateGuestSession(rawToken: string) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const session = await prisma.guestSession.findUnique({
    where: { tokenHash },
    include: {
      room: {
        include: { roomType: true },
      },
      guest: true,
      stay: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  // Update last seen heartbeat
  await prisma.guestSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return session;
}
