/**
 * Jayaasi — In-memory rate limiter
 *
 * Provides sliding-window rate limiting at multiple levels:
 *   - IP-level:   10 session creation requests per 60s window
 *   - Room-level: 5  session creations per room per 60s window
 *
 * For single-process (dev / single instance), this is sufficient.
 * For multi-instance production: replace the Map store with Redis via ioredis.
 *
 * Usage:
 *   const result = checkRateLimit('ip', clientIp, 10, 60);
 *   if (!result.allowed) return 429;
 */

/** @typedef {{ count: number; windowStart: number }} Window */

/** @type {Map<string, { count: number; windowStart: number }>} */
const store = new Map();

/**
 * Check and increment a sliding-window rate limit counter.
 *
 * @param {string} type     - Namespace prefix (e.g. 'ip', 'room', 'token')
 * @param {string} key      - Unique identifier within the namespace
 * @param {number} maxCount - Max allowed requests per window
 * @param {number} windowSec - Window size in seconds
 * @returns {{ allowed: boolean; remaining: number; resetAfter: number }}
 */
export function checkRateLimit(type, key, maxCount, windowSec) {
  const mapKey = `${type}:${key}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const entry = store.get(mapKey);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    store.set(mapKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxCount - 1, resetAfter: windowSec };
  }

  if (entry.count >= maxCount) {
    const resetAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxCount - entry.count, resetAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000) };
}

/**
 * Composite check: verifies BOTH ip-level and room-level limits.
 * Returns the first violation if any.
 *
 * @param {string} ip
 * @param {string} roomId
 * @returns {{ allowed: boolean; resetAfter: number; reason?: string }}
 */
export function checkSessionRateLimit(ip, roomId) {
  const ipResult = checkRateLimit('ip', ip, 10, 60);
  if (!ipResult.allowed) {
    return { allowed: false, resetAfter: ipResult.resetAfter, reason: 'IP_RATE_LIMITED' };
  }

  const roomResult = checkRateLimit('room', roomId, 5, 60);
  if (!roomResult.allowed) {
    return { allowed: false, resetAfter: roomResult.resetAfter, reason: 'ROOM_RATE_LIMITED' };
  }

  return { allowed: true, resetAfter: 0 };
}

/**
 * Extract client IP from Next.js request headers.
 * Falls back to 'unknown' if no IP found (local dev).
 *
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/** Periodically clean up expired windows to avoid memory leak (call every 5 min). */
export function cleanupExpiredWindows(windowSec = 60) {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= windowMs * 2) {
      store.delete(key);
    }
  }
}
