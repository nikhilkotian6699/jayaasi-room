-- CreateEnum
CREATE TYPE "QrStatus" AS ENUM ('ACTIVE', 'REVOKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "room_qr_codes" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "qr_public_id" VARCHAR(30) NOT NULL,
    "qr_version" INTEGER NOT NULL DEFAULT 1,
    "status" "QrStatus" NOT NULL DEFAULT 'ACTIVE',
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "room_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_sessions" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "device_fingerprint_hash" VARCHAR(128),
    "ip_hash" VARCHAR(128),

    CONSTRAINT "room_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_qr_codes_qr_public_id_key" ON "room_qr_codes"("qr_public_id");

-- CreateIndex
CREATE INDEX "room_qr_codes_room_id_status_idx" ON "room_qr_codes"("room_id", "status");

-- CreateIndex
CREATE INDEX "room_qr_codes_qr_public_id_idx" ON "room_qr_codes"("qr_public_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_sessions_token_hash_key" ON "room_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "room_sessions_room_id_status_expires_at_idx" ON "room_sessions"("room_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "room_sessions_token_hash_idx" ON "room_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "room_sessions_hotel_id_created_at_idx" ON "room_sessions"("hotel_id", "created_at");

-- AddForeignKey
ALTER TABLE "room_qr_codes" ADD CONSTRAINT "room_qr_codes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_sessions" ADD CONSTRAINT "room_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
