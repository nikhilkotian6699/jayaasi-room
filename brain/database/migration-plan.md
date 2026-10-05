# Jayaasi Rooms — Migration & Transition Plan

This document outlines the phased migration strategy from the in-memory/mock state to the PostgreSQL database with zero UI downtime and zero regressions.

---

## 1. Migration Milestones Overview

```
Phase 1: Database Foundation (Milestone 4 - Current)
   ├── Design Architecture & Data Dictionary
   ├── Install Prisma ORM & TypeScript definitions
   ├── Write schema.prisma with all 22 domain models
   ├── Run initial migration against local PostgreSQL (`jayaasi_rooms`)
   ├── Write idempotent seed.ts (Hotel, 11 Rooms, Services, Guest, Stay, Folios)
   ├── Create Singleton Prisma Client (`lib/prisma.ts`)
   ├── Build Repository/Query Boundary Layer (`lib/db/*`)
   └── Verify Database Integrity & Zero Frontend Regressions

Phase 2: Admin Operations Data Transition (Milestone 5)
   ├── Replace static `lib/admin-data.js` imports in admin actions with DB service queries
   ├── Connect `/admin/requests` to `service_requests` table
   ├── Connect `/admin/invoices` to `folios` and `invoices` tables
   └── Connect `/admin/rooms` to `rooms` and `stays` tables

Phase 3: Guest Real-Time Session & Order Transition (Milestone 6)
   ├── QR Scan code token generation to `guest_sessions`
   ├── Replace localStorage cart with `carts` and `cart_items`
   └── Replace frontend cart checkout with `orders` and `service_requests` creation
```

---

## 2. Idempotent Seeding Strategy

The seed script (`prisma/seed.ts`) must be completely deterministic and idempotent.
Every core record uses an `upsert`:
- Hotel: upserted by `slug: 'jayaasi-rooms'`.
- RoomTypes: upserted by `hotelId_code: { hotelId, code }`.
- Rooms: upserted by `hotelId_roomNumber: { hotelId, roomNumber }`.
- ServiceCategories: upserted by `hotelId_code: { hotelId, code }`.
- Services: upserted by `hotelId_code: { hotelId, code }`.
- Guest: upserted by `phone: '+91 98765 43210'`.
- Stay: upserted by `bookingReference: 'BK-2026-20401'`.
- Folio: upserted by `folioNumber: 'FOLIO-2026-204'`.
- TaxConfig: upserted by `hotelId_taxCode: { hotelId, taxCode: 'GST-5' }`.

Running `npx prisma db seed` repeatedly will never duplicate hotel rooms, duplicate items, or inflate invoice counts.

---

## 3. Backward Compatibility Safeguards

* **Preserve `lib/admin-data.js`**: During Milestone 4, existing UI components still import `lib/admin-data.js` so that Next.js client renders, tests, and builds remain 100% stable without breakage.
* **Dual-Read Readiness**: The repository layer in `lib/db/` will provide typed functions (`getHotelRooms()`, `getLiveRequests()`, `getRoomFolio()`) ready for seamless transition in subsequent steps.
* **Safety from Client Leaks**: Next.js App Router rules ensure that files under `lib/prisma.ts` and `lib/db/` are strictly used on server boundaries (`'use server'`, Route Handlers, or Server Actions).
