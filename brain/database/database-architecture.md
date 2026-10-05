# Jayaasi Rooms — Database Architecture

## 1. Executive Summary & Design Principles

The Jayaasi Rooms database architecture establishes a production-grade, highly normalized, multi-tenant/multi-hotel relational schema implemented on **PostgreSQL** via **Prisma ORM**.

The database architecture directly underpins two decoupled application experiences:
1. **Guest Mobile Web Application**: Mobile-first, QR-scanned suite portal for Room 204 (and future rooms), room service dining, housekeeping, cab booking, boutique store, and cart requests.
2. **Hotel Operations & Admin Portal**: Command center for dispatch desks, housekeeping management, real-time multi-room folios, and GST tax invoicing.

### Core Architectural Principles
* **Multi-Hotel Foundation**: Every operational entity maintains a direct or traceable relationship to `hotel_id`, allowing future expansion from a single property (Jayaasi Rooms Pune) to multi-property hotel chains without structural schema refactoring.
* **Separation of Entity vs. Stay vs. Session**:
  * `Guest` models human identity and contact info.
  * `Stay` models the bounded temporal engagement of a guest in a specific room.
  * `GuestSession` models browser authentication, QR token verification, and session lifecycle.
* **Immutable Historical Accounting**: Orders, folios, and invoices store **price snapshots**, **tax rates**, and **line item totals** at the moment of creation. Updating a service's catalog price or a hotel tax rate will never retroactively mutate past financial records.
* **Decoupled Orders vs. Service Requests**:
  * An `Order` represents a guest financial commitment / purchase.
  * A `ServiceRequest` represents the operational ticket dispatched to hotel departments (*Kitchen*, *Housekeeping*, *Laundry*, *Concierge*, *Transport*).
* **Strong Typing & Relational Integrity**: Full foreign key constraints with restrictive cascading rules protecting audit logs, invoices, and stay histories.
* **Precise Monetary Storage**: All currency, pricing, discount, and tax fields use PostgreSQL `DECIMAL(10, 2)` / Prisma `Decimal` to eliminate binary floating-point errors.

---

## 2. Architectural Layers

```
                     ┌───────────────────────────────────────┐
                     │          Next.js App Router           │
                     │  (Client Components, Route Handlers)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         Domain Service Layer          │
                     │  (lib/services/*: billing, dispatch)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         Data Access / Repositories    │
                     │  (lib/db/*: hotels, rooms, folios)   │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │             Prisma Client             │
                     │       (Type-safe ORM Singleton)       │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         PostgreSQL Database           │
                     │   (Relational Engine, Indexes, UUIDs) │
                     └───────────────────────────────────────┘
```

---

## 3. High-Level Domain Boundaries

1. **Property & Infrastructure**:
   - `Hotel`: Central tenant anchor (GSTIN, legal name, address, contact, timezone).
   - `RoomType`: Categorical classification (Business Suite, Executive Suite, Deluxe King).
   - `Room`: Physical hotel room assigned to a floor with operational status.
2. **Identity & Access Management**:
   - `Guest`: Guest profile, phone, email, country code.
   - `StaffUser`: Hotel staff with role-based access (*SUPER_ADMIN*, *HOTEL_ADMIN*, *MANAGER*, *RECEPTION*, *HOUSEKEEPING*, *KITCHEN*, etc.).
   - `Stay`: Guest stay reservation lifecycle (*CHECKED_IN*, *CHECKED_OUT*).
   - `GuestSession`: Hashed session tokens, QR code access tokens, expiry tracking.
3. **Catalog & Menu**:
   - `ServiceCategory`: System categories (*FOOD*, *HOUSEKEEPING*, *LAUNDRY*, *SHOE_CARE*, *LUGGAGE*, *CAB*, *STORE*).
   - `Service`: Base operational and consumable services with department mappings.
   - `FoodMenuItem`: In-room dining specifics (dietary type, spice level, preparation time).
   - `Product`: Jayaasi Store retail goods with SKU and inventory stock tracking.
4. **Guest Cart & Ordering**:
   - `Cart` & `CartItem`: Ephemeral guest shopping cart prior to confirmation.
   - `Order` & `OrderItem`: Permanent transaction records with price and tax snapshots.
5. **Operations & Department Dispatching**:
   - `ServiceRequest`: Departmental work orders (*NEW*, *IN_PROGRESS*, *COMPLETED*).
   - `Department`: Kitchen, Housekeeping, Laundry, Bell Desk, Transport, Concierge.
6. **Billing, Invoicing & Financials**:
   - `Folio`: Real-time guest room bill attached to an active `Stay`.
   - `FolioCharge`: Granular charges posted from room tariff, dining, or manual charges.
   - `Invoice`: Official GST-compliant tax invoice snapshot.
   - `Payment`: Transaction receipts, payment method, provider references.
   - `TaxConfig`: Configurable CGST, SGST, IGST tax rules.
7. **System Governance & Audit**:
   - `Notification`: In-app and system alerts.
   - `AuditLog`: Immutable change logs for room status, billing adjustments, and security events.

---

## 4. Multi-Tenant / Multi-Hotel Scope

The composite constraint `@@unique([hotelId, roomNumber])` ensures that room numbers are scoped per hotel property.
Similarly, `hotelId` is stored across service catalogs, staff rosters, orders, and folios, enabling strict tenant isolation at the query and service layer.

---

## 5. Security & Isolation Standard

1. **Client Isolation**: The database and Prisma Client are strictly server-side. No client bundle ever receives raw credentials.
2. **Access Token Hashing**: QR codes and guest session tokens are stored using cryptographic hashes (`tokenHash`), preventing token exposure in the event of database inspection.
3. **Audit Trails**: Every status change on rooms, folios, or requests generates an `AuditLog` entry tracking `actorUserId`, `action`, `oldValue`, and `newValue`.
