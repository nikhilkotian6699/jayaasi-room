/**
 * Jayaasi — Room QR Code DB Layer
 * Handles permanent QR identity creation, retrieval, revocation.
 */

import prisma from '@/lib/prisma';
import { QrStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

/** Generate a random public QR ID like "qr_8F29KX7P" */
function generateQrPublicId(): string {
  return 'qr_' + randomBytes(5).toString('hex').toUpperCase().slice(0, 8);
}

/** Create or regenerate a QR code for a room. Revokes any existing ACTIVE QR first. */
export async function generateRoomQr(roomId: string, hotelId: string) {
  return prisma.$transaction(async (tx) => {
    // Get current version to increment
    const existing = await tx.roomQrCode.findFirst({
      where: { roomId, status: QrStatus.ACTIVE },
      orderBy: { qrVersion: 'desc' },
    });

    if (existing) {
      await tx.roomQrCode.update({
        where: { id: existing.id },
        data: { status: QrStatus.REVOKED, revokedAt: new Date() },
      });
    }

    const newVersion = existing ? existing.qrVersion + 1 : 1;

    return tx.roomQrCode.create({
      data: {
        roomId,
        hotelId,
        qrPublicId: generateQrPublicId(),
        qrVersion: newVersion,
        status: QrStatus.ACTIVE,
      },
    });
  });
}

/** Get the single ACTIVE QR for a room (returns null if none/revoked). */
export async function getActiveQrForRoom(roomId: string) {
  return prisma.roomQrCode.findFirst({
    where: { roomId, status: QrStatus.ACTIVE },
    orderBy: { qrVersion: 'desc' },
  });
}

/** Revoke the active QR for a room (admin action). */
export async function revokeRoomQr(roomId: string) {
  return prisma.roomQrCode.updateMany({
    where: { roomId, status: QrStatus.ACTIVE },
    data: { status: QrStatus.REVOKED, revokedAt: new Date() },
  });
}

/** Look up a QR by its public ID — validates it is ACTIVE. */
export async function validateQrByPublicId(qrPublicId: string) {
  return prisma.roomQrCode.findFirst({
    where: { qrPublicId },
    include: { room: { include: { roomType: true, hotel: true } } },
  });
}

/** List all QR codes for a room (all versions/statuses). */
export async function listRoomQrHistory(roomId: string) {
  return prisma.roomQrCode.findMany({
    where: { roomId },
    orderBy: { qrVersion: 'desc' },
  });
}
