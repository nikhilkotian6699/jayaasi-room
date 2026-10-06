'use client';

/**
 * QrLandingPage — The main QR scan landing experience.
 *
 * This is what a guest sees after scanning the room QR code.
 * States:
 *   idle/loading → skeleton/spinner
 *   active       → Session active card with countdown + hotel services button
 *   expired      → SessionExpired component
 *   error        → SessionExpired with error code
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SessionTimer from './SessionTimer';
import SessionExpired from './SessionExpired';
import { useRoomSession } from './useRoomSession';

/**
 * @param {{ hotelCode: string; roomCode: string }} props
 */
export default function QrLandingPage({ hotelCode, roomCode }) {
  const router = useRouter();
  const {
    state,
    error,
    hotel,
    room,
    remainingSeconds,
    requestNewSession,
  } = useRoomSession(hotelCode, roomCode);

  // Navigate to hotel guest app once session is active and user taps "Enter"
  const handleEnterGuestApp = () => {
    if (!hotel || !room) return;
    // Redirect to the existing guest app with hotelSlug + roomId URL pattern
    // The existing app at /{hotelSlug}/{roomNumber} will continue working
    const hotelSlug = hotel.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${hotelSlug}/${room.number}/services`);
  };

  // ── Skeleton / Loading state ───────────────────────────────────
  if (state === 'idle' || state === 'loading') {
    return (
      <div className="qr-landing">
        <div className="qr-landing__loading" aria-busy="true" aria-label="Loading room session">
          <div className="qr-landing__spinner" aria-hidden="true" />
          <p className="qr-landing__loading-text">Verifying room access…</p>
        </div>
      </div>
    );
  }

  // ── Error / Expired state ──────────────────────────────────────
  if (state === 'expired' || state === 'error') {
    return (
      <div className="qr-landing">
        <SessionExpired
          errorCode={error || (state === 'expired' ? 'SESSION_EXPIRED' : 'SERVER_ERROR')}
          hotelName={hotel?.name}
          roomNumber={room?.number}
          roomType={room?.type}
          onRequestNewSession={requestNewSession}
        />
      </div>
    );
  }

  // ── Active session ─────────────────────────────────────────────
  return (
    <div className="qr-landing">
      {/* Ambient background gradient */}
      <div className="qr-landing__bg" aria-hidden="true" />

      <div className="qr-landing__card">
        {/* Hotel branding */}
        <div className="qr-landing__hotel-header">
          <div className="qr-landing__hotel-logo-ring" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(122,12,36,0.9)" />
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">J</text>
            </svg>
          </div>
          <div>
            <div className="qr-landing__hotel-name">{hotel?.name}</div>
            <div className="qr-landing__powered-by">Powered by Jayaasi</div>
          </div>
        </div>

        {/* Divider */}
        <div className="qr-landing__divider" />

        {/* Room identity */}
        <div className="qr-landing__room-identity">
          <div className="qr-landing__room-number">
            Room {room?.number}
          </div>
          {room?.type && (
            <div className="qr-landing__room-type">{room.type}</div>
          )}
          {room?.floor && (
            <div className="qr-landing__room-floor">Floor {room.floor}</div>
          )}
        </div>

        {/* Session timer */}
        <div className="qr-landing__timer-section">
          <div className="qr-landing__session-label">Session Active</div>
          <SessionTimer remainingSeconds={remainingSeconds} />
          {remainingSeconds <= 10 && remainingSeconds > 0 && (
            <p className="qr-landing__expire-warn">Your session expires soon.</p>
          )}
        </div>

        {/* CTA: Enter guest app */}
        <button
          id="enter-guest-app-btn"
          className="qr-landing__enter-btn"
          onClick={handleEnterGuestApp}
          aria-label="Access hotel services"
        >
          <span>Access Hotel Services</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Session info fine print */}
        <p className="qr-landing__session-note">
          Session expires at{' '}
          {room && hotel
            ? new Date(
                Date.now() + remainingSeconds * 1000
              ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : '--:--:--'}
          {' '}· Re-scan QR to renew
        </p>
      </div>
    </div>
  );
}
