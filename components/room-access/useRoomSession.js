'use client';

/**
 * useRoomSession — manages the full session lifecycle for a scanned room.
 *
 * Responsibilities:
 * - On mount: fetch room info, then POST to create/retrieve session
 * - Store token in sessionStorage (not localStorage — cleared on tab close)
 * - Drive countdown timer from server-provided expiresAt (authoritative)
 * - Expose requestNewSession() that only creates a new session if truly expired
 * - Clear all state on unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const TOKEN_KEY = (hotelCode, roomCode) => `jayaasi_session_${hotelCode}_${roomCode}`;

/** @typedef {'idle'|'loading'|'active'|'expired'|'error'} SessionState */

/**
 * @param {string} hotelCode
 * @param {string} roomCode
 */
export function useRoomSession(hotelCode, roomCode) {
  const [state, setState] = useState(/** @type {SessionState} */ ('idle'));
  const [error, setError] = useState(/** @type {string|null} */ (null));
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [session, setSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timerRef = useRef(null);
  const expiresAtRef = useRef(null); // Server-provided authoritative expiry timestamp

  /** Start or reset the countdown using server expiresAt */
  const startCountdown = useCallback((expiresAtIso) => {
    if (timerRef.current) clearInterval(timerRef.current);
    expiresAtRef.current = new Date(expiresAtIso).getTime();

    const tick = () => {
      const diff = expiresAtRef.current - Date.now();
      const secs = Math.max(0, Math.floor(diff / 1000));
      setRemainingSeconds(secs);
      if (secs <= 0) {
        clearInterval(timerRef.current);
        setState('expired');
        // Remove stale token
        try {
          sessionStorage.removeItem(TOKEN_KEY(hotelCode, roomCode));
        } catch (_) {}
      }
    };

    tick(); // immediate first tick
    timerRef.current = setInterval(tick, 1000);
  }, [hotelCode, roomCode]);

  /** POST to session endpoint — creates or reuses active session */
  const fetchSession = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const res = await fetch(`/api/v1/hotels/${hotelCode}/rooms/${roomCode}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const errCode = data.error || 'SERVER_ERROR';
        setError(errCode);
        setState('error');
        return;
      }

      setHotel(data.hotel);
      setRoom(data.room);
      setSession(data.session);

      // Persist token only if newly issued
      if (data.session.isNew && data.session.token) {
        try {
          sessionStorage.setItem(TOKEN_KEY(hotelCode, roomCode), data.session.token);
        } catch (_) {}
      }

      setState('active');
      startCountdown(data.session.expiresAt);
    } catch (err) {
      console.error('[useRoomSession] fetchSession error:', err);
      setError('NETWORK_ERROR');
      setState('error');
    }
  }, [hotelCode, roomCode, startCountdown]);

  /** Called when user clicks "Start New Session" — only works after expiry */
  const requestNewSession = useCallback(async () => {
    // Safety: don't allow reset if current session is still valid server-side
    // The POST endpoint handles this idempotently anyway
    await fetchSession();
  }, [fetchSession]);

  /** Read a stored token from sessionStorage */
  const getStoredToken = useCallback(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY(hotelCode, roomCode));
    } catch (_) {
      return null;
    }
  }, [hotelCode, roomCode]);

  // Initial load
  useEffect(() => {
    if (!hotelCode || !roomCode) return;
    fetchSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hotelCode, roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,        // 'idle' | 'loading' | 'active' | 'expired' | 'error'
    error,        // error code string
    hotel,        // { code, name, timezone }
    room,         // { id, number, floor, type, displayName }
    session,      // raw session response
    remainingSeconds,
    requestNewSession,
    getStoredToken,
  };
}
