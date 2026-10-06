'use client';

/**
 * SessionTimer — Animated countdown component.
 * Displays remaining session time and a progress ring.
 */

import { useMemo } from 'react';

const TOTAL_SECONDS = 60;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * @param {{ remainingSeconds: number }} props
 */
export default function SessionTimer({ remainingSeconds }) {
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress = Math.max(0, Math.min(1, remainingSeconds / TOTAL_SECONDS));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Color transitions: green → amber → red
  const color = useMemo(() => {
    if (remainingSeconds > 30) return '#10b981'; // emerald
    if (remainingSeconds > 10) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }, [remainingSeconds]);

  const urgentPulse = remainingSeconds <= 10 && remainingSeconds > 0;

  return (
    <div className="session-timer" aria-live="polite" aria-label={`Session time remaining: ${display}`}>
      <div className={`session-timer__ring-wrap${urgentPulse ? ' session-timer__ring-wrap--pulse' : ''}`}>
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="session-timer__svg"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        {/* Countdown text inside ring */}
        <div className="session-timer__count" style={{ color }}>
          {display}
        </div>
      </div>

      {/* Status label */}
      <div className="session-timer__label">
        {remainingSeconds > 30 && 'Session active'}
        {remainingSeconds > 10 && remainingSeconds <= 30 && '⚠ Session expiring soon'}
        {remainingSeconds <= 10 && remainingSeconds > 0 && '🔴 Session expiring now'}
      </div>
    </div>
  );
}
