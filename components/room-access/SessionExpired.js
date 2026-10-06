'use client';

/**
 * SessionExpired — Full-screen expired state UI.
 * Shown when the 60-second session countdown reaches zero.
 */

import { useState } from 'react';

const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: { title: 'Room Not Found', body: 'This room could not be found. Please check with reception.' },
  HOTEL_NOT_FOUND: { title: 'Property Not Found', body: 'This hotel property is not recognised. Please check with reception.' },
  ROOM_INACTIVE: { title: 'Room Unavailable', body: 'This room is currently unavailable. Please contact the front desk.' },
  QR_DISABLED: { title: 'QR Inactive', body: 'This QR code has been deactivated. Please ask reception for assistance.' },
  QR_REVOKED: { title: 'QR Revoked', body: 'This QR code has been revoked. Please request a new one from reception.' },
  SESSION_EXPIRED: { title: 'Session Expired', body: 'Your access session has expired. Tap below to start a new one.' },
  SESSION_REVOKED: { title: 'Session Revoked', body: 'Your session was ended by the hotel. Please scan the QR again.' },
  RATE_LIMITED: { title: 'Too Many Requests', body: 'You have made too many requests. Please wait a moment and try again.' },
  IP_RATE_LIMITED: { title: 'Too Many Requests', body: 'Too many requests from your network. Please wait and try again.' },
  ROOM_RATE_LIMITED: { title: 'Too Many Requests', body: 'Too many session requests for this room. Please wait a moment.' },
  NETWORK_ERROR: { title: 'Connection Problem', body: 'Could not connect to the server. Please check your internet and try again.' },
  SERVER_ERROR: { title: 'Something Went Wrong', body: 'An unexpected error occurred. Please try again or contact reception.' },
};

/**
 * @param {{
 *   errorCode?: string;
 *   hotelName?: string;
 *   roomNumber?: string;
 *   roomType?: string;
 *   onRequestNewSession: () => void;
 *   isLoading?: boolean;
 * }} props
 */
export default function SessionExpired({
  errorCode,
  hotelName,
  roomNumber,
  roomType,
  onRequestNewSession,
  isLoading = false,
}) {
  const [tapping, setTapping] = useState(false);

  const info = errorCode
    ? (ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.SESSION_EXPIRED)
    : ERROR_MESSAGES.SESSION_EXPIRED;

  const showNewSessionButton = !errorCode ||
    ['SESSION_EXPIRED', 'SESSION_REVOKED', 'NETWORK_ERROR', 'SERVER_ERROR'].includes(errorCode);

  const handleTap = async () => {
    if (tapping || isLoading) return;
    setTapping(true);
    await onRequestNewSession();
    setTapping(false);
  };

  return (
    <div className="session-expired">
      {/* Ambient glow background */}
      <div className="session-expired__glow" aria-hidden="true" />

      {/* Card */}
      <div className="session-expired__card" role="alert">
        {/* Icon */}
        <div className="session-expired__icon-wrap">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="28" fill="rgba(239,68,68,0.15)" />
            <circle cx="28" cy="28" r="20" fill="rgba(239,68,68,0.2)" />
            {/* Clock icon */}
            <circle cx="28" cy="28" r="11" stroke="#ef4444" strokeWidth="2" fill="none" />
            <line x1="28" y1="22" x2="28" y2="28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="28" x2="33" y2="31" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="session-expired__title">{info.title}</h1>
        <p className="session-expired__body">{info.body}</p>

        {/* Room context */}
        {(hotelName || roomNumber) && (
          <div className="session-expired__room-chip">
            {hotelName && <span className="session-expired__hotel">{hotelName}</span>}
            {roomNumber && (
              <span className="session-expired__room-badge">
                Room {roomNumber}
                {roomType && ` · ${roomType}`}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        {showNewSessionButton && (
          <button
            id="start-new-session-btn"
            className={`session-expired__btn${tapping || isLoading ? ' session-expired__btn--loading' : ''}`}
            onClick={handleTap}
            disabled={tapping || isLoading}
            aria-busy={tapping || isLoading}
          >
            {tapping || isLoading ? (
              <span className="session-expired__spinner" aria-hidden="true" />
            ) : null}
            {tapping || isLoading ? 'Starting session…' : 'Start New Session'}
          </button>
        )}

        {/* Help text */}
        <p className="session-expired__help">
          Powered by <strong>Jayaasi Technology</strong>
        </p>
      </div>
    </div>
  );
}
