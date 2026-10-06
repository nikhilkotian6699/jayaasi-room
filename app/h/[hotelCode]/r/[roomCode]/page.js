/**
 * /h/[hotelCode]/r/[roomCode]
 *
 * Permanent QR landing page. The physical QR code always points here.
 * This page resolves hotel + room and creates a temporary 60-second session.
 *
 * URL example: https://jayaasi.com/h/LIVINN/r/204
 */

import QrLandingPage from '@/components/room-access/QrLandingPage';

export async function generateMetadata({ params }) {
  const { hotelCode, roomCode } = await params;
  return {
    title: `Room ${roomCode} — Jayaasi Guest Access`,
    description: `Scan to access hotel services for Room ${roomCode} at ${hotelCode}.`,
    robots: 'noindex,nofollow', // QR pages should not be indexed
  };
}

export default async function QrRoomPage({ params }) {
  const { hotelCode, roomCode } = await params;

  return (
    <main className="qr-page-root">
      <QrLandingPage hotelCode={hotelCode} roomCode={roomCode} />
    </main>
  );
}
