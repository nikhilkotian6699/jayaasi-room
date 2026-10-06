/**
 * QR & Room Session — Integration Tests
 *
 * Tests the full QR + 60-second session lifecycle:
 *   - QR generation / revocation
 *   - Session creation from QR scan
 *   - Session reuse while valid
 *   - Session expiry
 *   - New session after expiry
 *   - Concurrency: only one ACTIVE session per room
 *   - Multi-hotel isolation (Hotel A Room 204 ≠ Hotel B Room 204)
 *   - Rate limiting behaviour
 */

import { PrismaClient } from '@prisma/client';
import {
  generateRoomQr,
  getActiveQrForRoom,
  revokeRoomQr,
} from '../lib/db/room-qr';
import {
  getOrCreateRoomSession,
  validateRoomSessionToken,
  revokeRoomSession,
  remainingSeconds,
  generateSecureToken,
  hashToken,
  SESSION_DURATION_SECONDS,
} from '../lib/db/room-sessions';
import { checkRateLimit, checkSessionRateLimit } from '../lib/rate-limit';

const prisma = new PrismaClient();

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${name}${extra ? ' — ' + extra : ''}`);
    failCount++;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST HELPERS: create temporary hotel + room for isolation
// ─────────────────────────────────────────────────────────────────────────────

async function createTestHotel(suffix: string) {
  // Create a minimal room type first
  const hotel = await prisma.hotel.create({
    data: {
      name: `Test Hotel ${suffix}`,
      slug: `test-hotel-${suffix}-${Date.now()}`,
      code: `TTEST${suffix.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-3)}`,
      legalName: `Test Hotel ${suffix} Pvt Ltd`,
      address: '123 Test Lane',
      city: 'Testpur',
      state: 'Maharashtra',
      postalCode: '411001',
      phone: '+91 20 0000 0000',
      email: `test${suffix}@jayaasi.com`,
    },
  });

  const roomType = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Standard',
      code: `STD-${suffix}`,
      basePrice: 1000,
    },
  });

  return { hotel, roomType };
}

async function createTestRoom(hotelId: string, roomTypeId: string, roomNumber: string) {
  return prisma.room.create({
    data: {
      hotelId,
      roomTypeId,
      floor: '1',
      roomNumber,
      displayName: `Room ${roomNumber}`,
    },
  });
}

async function cleanupTestHotel(hotelId: string) {
  // Delete in dependency order
  await prisma.roomSession.deleteMany({ where: { hotelId } });
  await prisma.roomQrCode.deleteMany({ where: { hotelId } });
  await prisma.room.deleteMany({ where: { hotelId } });
  await prisma.roomType.deleteMany({ where: { hotelId } });
  await prisma.hotel.delete({ where: { id: hotelId } });
}

// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n🧪 Jayaasi QR & Session System — Integration Tests\n');

  // ── Section 1: Utility Functions ────────────────────────────────────────
  console.log('\n── 1. Utility Functions ────────────────────────────────────');

  const token = generateSecureToken();
  assert(token.length === 96, 'generateSecureToken produces 96-char hex token', `got ${token.length}`);

  const hashed = hashToken(token);
  assert(hashed.length === 64, 'hashToken produces 64-char SHA-256 hex', `got ${hashed.length}`);
  assert(hashed !== token, 'Hashed token differs from raw token');

  const future = new Date(Date.now() + 45_000);
  const secs = remainingSeconds(future);
  assert(secs >= 44 && secs <= 45, `remainingSeconds returns ~45 for future timestamp (got ${secs})`);

  const past = new Date(Date.now() - 5000);
  assert(remainingSeconds(past) === 0, 'remainingSeconds returns 0 for past timestamp');

  // ── Section 2: Rate Limiter ──────────────────────────────────────────────
  console.log('\n── 2. Rate Limiting ─────────────────────────────────────────');

  const testIp = `192.0.2.${Math.floor(Math.random() * 254) + 1}`;
  let allowed = 0;
  for (let i = 0; i < 12; i++) {
    const result = checkRateLimit('ip-test', testIp, 10, 60);
    if (result.allowed) allowed++;
  }
  assert(allowed === 10, `Rate limiter allows exactly 10 requests then blocks (allowed: ${allowed})`);

  const testRoom = `TEST_RL_${Date.now()}`;
  const rl = checkSessionRateLimit('1.2.3.4', testRoom);
  assert(rl.allowed === true, 'Fresh IP + room is allowed by checkSessionRateLimit');

  // ── Section 3: QR Code Operations ──────────────────────────────────────
  console.log('\n── 3. QR Code Operations ────────────────────────────────────');

  const { hotel: hA, roomType: rtA } = await createTestHotel('A');
  const roomA = await createTestRoom(hA.id, rtA.id, '204');

  // No QR initially
  const noQr = await getActiveQrForRoom(roomA.id);
  assert(noQr === null, 'Room has no QR before generation');

  // Generate first QR
  const qr1 = await generateRoomQr(roomA.id, hA.id);
  assert(qr1.status === 'ACTIVE', 'Generated QR is ACTIVE');
  assert(qr1.qrVersion === 1, 'First QR has version 1');
  assert(qr1.qrPublicId.startsWith('qr_'), 'QR public ID has "qr_" prefix');

  const activeQr = await getActiveQrForRoom(roomA.id);
  assert(activeQr?.id === qr1.id, 'getActiveQrForRoom returns the generated QR');

  // Regenerate QR — old becomes revoked, new gets v2
  const qr2 = await generateRoomQr(roomA.id, hA.id);
  assert(qr2.qrVersion === 2, 'Regenerated QR has version 2');
  assert(qr2.status === 'ACTIVE', 'New QR is ACTIVE');
  assert(qr2.qrPublicId !== qr1.qrPublicId, 'New QR has different public ID');

  const oldQr = await prisma.roomQrCode.findUnique({ where: { id: qr1.id } });
  assert(oldQr?.status === 'REVOKED', 'Old QR v1 becomes REVOKED after regeneration');

  // Revoke active QR
  await revokeRoomQr(roomA.id);
  const afterRevoke = await getActiveQrForRoom(roomA.id);
  assert(afterRevoke === null, 'No active QR after revokeRoomQr');

  // ── Section 4: Session Lifecycle ─────────────────────────────────────────
  console.log('\n── 4. Session Lifecycle ─────────────────────────────────────');

  // Re-generate QR so session creation can proceed
  await generateRoomQr(roomA.id, hA.id);

  // Create first session
  const { session: s1, token: t1, isNew: n1 } = await getOrCreateRoomSession(roomA.id, hA.id, 'ip1');
  assert(n1 === true, 'First session is new (isNew=true)');
  assert(typeof t1 === 'string' && t1!.length === 96, 'Token returned for new session');
  assert(s1!.status === 'ACTIVE', 'New session is ACTIVE');
  assert(remainingSeconds(s1!.expiresAt) > 58, 'New session has ~60 seconds remaining');

  // Re-scan while session still valid → return existing
  const { session: s2, token: t2, isNew: n2 } = await getOrCreateRoomSession(roomA.id, hA.id, 'ip2');
  assert(n2 === false, 'Second scan returns existing session (isNew=false)');
  assert(s2!.id === s1!.id, 'Same session ID returned on re-scan');
  assert(t2 === null, 'No new token returned for existing session');

  // Validate good token
  const { valid: v1, session: vs1 } = await validateRoomSessionToken(t1!);
  assert(v1 === true, 'Valid token passes validateRoomSessionToken');
  assert(vs1!.id === s1!.id, 'Validated session matches original session');

  // Invalid token rejected
  const { valid: vBad } = await validateRoomSessionToken('deadbeef'.repeat(12));
  assert(vBad === false, 'Invalid/unknown token is rejected');

  // Revoke session
  await revokeRoomSession(s1!.id);
  const { valid: vRevoked, error: eRevoked } = await validateRoomSessionToken(t1!);
  assert(vRevoked === false && eRevoked === 'SESSION_REVOKED', 'Revoked session is correctly rejected');

  // After revoke, new session creation works
  const { session: s3, isNew: n3 } = await getOrCreateRoomSession(roomA.id, hA.id, 'ip3');
  assert(n3 === true, 'New session created after previous was revoked');
  assert(s3!.id !== s1!.id, 'New session has different ID');

  // ── Section 5: Expired Session ───────────────────────────────────────────
  console.log('\n── 5. Expired Session Handling ──────────────────────────────');

  // Force-create an already-expired session for testing
  const expiredToken = generateSecureToken();
  const expiredHash = hashToken(expiredToken);
  const expiredSession = await prisma.roomSession.create({
    data: {
      roomId: roomA.id,
      hotelId: hA.id,
      tokenHash: expiredHash,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() - 5000), // 5 seconds in the past
    },
  });

  const { valid: vExp, error: eExp } = await validateRoomSessionToken(expiredToken);
  assert(vExp === false && eExp === 'SESSION_EXPIRED', 'Expired session is rejected with SESSION_EXPIRED');

  // Verify the DB was updated to EXPIRED
  const dbExpired = await prisma.roomSession.findUnique({ where: { id: expiredSession.id } });
  assert(dbExpired?.status === 'EXPIRED', 'Expired session status updated to EXPIRED in DB');

  // ── Section 6: Multi-Hotel Isolation ─────────────────────────────────────
  console.log('\n── 6. Multi-Hotel Tenant Isolation ──────────────────────────');

  const { hotel: hB, roomType: rtB } = await createTestHotel('B');
  const roomB = await createTestRoom(hB.id, rtB.id, '204'); // same room number!
  await generateRoomQr(roomB.id, hB.id);

  const { session: sA } = await getOrCreateRoomSession(roomA.id, hA.id);
  const { session: sB } = await getOrCreateRoomSession(roomB.id, hB.id);

  assert(sA!.roomId !== sB!.roomId, 'Hotel A Room 204 and Hotel B Room 204 have different roomIds');
  assert(sA!.hotelId !== sB!.hotelId, 'Sessions are isolated to their respective hotels');
  assert(sA!.id !== sB!.id, 'Separate sessions created for same room number in different hotels');

  // ── Section 7: Concurrency Safety ────────────────────────────────────────
  console.log('\n── 7. Concurrency Safety ────────────────────────────────────');

  // Revoke existing sessions
  await prisma.roomSession.updateMany({
    where: { roomId: roomA.id, status: 'ACTIVE' },
    data: { status: 'REVOKED', revokedAt: new Date() },
  });

  // Fire 5 concurrent session requests for the same room
  const concurrentResults = await Promise.allSettled(
    Array.from({ length: 5 }).map(() => getOrCreateRoomSession(roomA.id, hA.id))
  );

  const successes = concurrentResults.filter((r) => r.status === 'fulfilled');
  const sessionIds = new Set(
    successes.map((r) => (r as PromiseFulfilledResult<{ session: { id: string } | null }>).value.session?.id)
  );

  assert(successes.length === 5, `All 5 concurrent requests completed (${successes.length}/5)`);
  assert(sessionIds.size === 1, `Exactly 1 unique session created from 5 concurrent scans (found ${sessionIds.size})`);

  // ── Section 8: Session Duration Constant ─────────────────────────────────
  console.log('\n── 8. Session Duration ──────────────────────────────────────');
  assert(SESSION_DURATION_SECONDS === 60, `SESSION_DURATION_SECONDS is 60 (got ${SESSION_DURATION_SECONDS})`);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await cleanupTestHotel(hA.id);
  await cleanupTestHotel(hB.id);

  // ── Results ───────────────────────────────────────────────────────────────
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed\n`);
  if (failCount > 0) process.exit(1);
}

runTests()
  .catch((e) => { console.error('Fatal error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
