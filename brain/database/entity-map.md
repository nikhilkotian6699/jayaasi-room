# Jayaasi Rooms — Entity Map

This document maps all real-world concepts and existing mock structures to their formal database entities.

## 1. Domain Entities Summary

| Entity | DB Model Name | Primary Key | Key Relationships | Purpose |
|---|---|---|---|---|
| **Hotel** | `Hotel` | UUID (`id`) | `rooms`, `staff`, `categories`, `taxConfigs` | Central tenant record representing a hotel property. |
| **Room Type** | `RoomType` | UUID (`id`) | `hotel`, `rooms` | Describes suite category, capacity, and baseline nightly tariff. |
| **Room** | `Room` | UUID (`id`) | `hotel`, `roomType`, `stays` | Physical suite/room with floor and operational status. |
| **Guest** | `Guest` | UUID (`id`) | `stays`, `sessions` | Real-world customer identity, contact info, and preferences. |
| **Staff User** | `StaffUser` | UUID (`id`) | `hotel`, `serviceRequests`, `auditLogs` | Hotel employees with designated roles and operational permissions. |
| **Stay** | `Stay` | UUID (`id`) | `hotel`, `guest`, `room`, `folios`, `orders` | Temporal reservation/occupancy duration of a guest in a room. |
| **Guest Session** | `GuestSession` | UUID (`id`) | `hotel`, `stay`, `guest`, `room`, `carts` | Active browser/device session linked to room QR token. |
| **Service Category** | `ServiceCategory` | UUID (`id`) | `hotel`, `services` | Top-level grouping (Food, Housekeeping, Laundry, Cab, etc.). |
| **Service** | `Service` | UUID (`id`) | `hotel`, `category`, `foodDetails` | Catalog items and operational requests available to guests. |
| **Food Menu Item** | `FoodMenuItem` | UUID (`id`) | `service` | Extended metadata for dining (dietary type, spice level). |
| **Store Product** | `Product` | UUID (`id`) | `hotel`, `category` | Retail merchandise sold in the Jayaasi Boutique Store. |
| **Cart** | `Cart` | UUID (`id`) | `hotel`, `guestSession`, `items` | Ephemeral guest shopping cart prior to order placement. |
| **Cart Item** | `CartItem` | UUID (`id`) | `cart`, `service`, `product` | Individual item within a shopping cart. |
| **Order** | `Order` | UUID (`id`) | `hotel`, `stay`, `guest`, `room`, `items` | Confirmed transaction with immutable financial snapshots. |
| **Order Item** | `OrderItem` | UUID (`id`) | `order` | Line item with frozen price, tax rate, and quantity. |
| **Service Request** | `ServiceRequest` | UUID (`id`) | `hotel`, `stay`, `room`, `order`, `service` | Departmental dispatch work ticket for hotel staff. |
| **Folio** | `Folio` | UUID (`id`) | `hotel`, `stay`, `charges`, `invoices`, `payments` | Master room ledger tracking all billed charges and balance. |
| **Folio Charge** | `FolioCharge` | UUID (`id`) | `folio`, `order` | Granular itemized charge applied to the stay folio. |
| **Invoice** | `Invoice` | UUID (`id`) | `hotel`, `stay`, `folio`, `payments` | Formal GST-compliant tax document with invoice number. |
| **Payment** | `Payment` | UUID (`id`) | `hotel`, `stay`, `folio`, `invoice` | Recorded guest payment or settlement receipt. |
| **Tax Config** | `TaxConfig` | UUID (`id`) | `hotel` | Configurable tax rates (CGST, SGST, IGST) per hotel. |
| **Notification** | `Notification` | UUID (`id`) | `hotel`, `guest`, `staffUser` | System-wide alerts and guest dispatch notifications. |
| **Audit Log** | `AuditLog` | UUID (`id`) | `hotel`, `staffUser` | Immutable security and change history log. |

---

## 2. Mock Data to Real Entity Mapping

| Existing Mock Source | Mock Concept | Target Database Entity | Notes |
|---|---|---|---|
| `lib/admin-data.js` -> `SUITE_ROOMS` | Room 204, 205, etc. | `Room` + `RoomType` | Scoped by `hotel_id`, unique `(hotel_id, room_number)`. |
| `lib/admin-data.js` -> `SUITE_ROOMS.guest` | Ananya Mehta | `Guest` + `Stay` | Room occupancy is modeled as an active `Stay` with status `CHECKED_IN`. |
| `lib/admin-data.js` -> `INITIAL_ROOM_REQUESTS` | `REQ-1042` | `ServiceRequest` | Tied to `hotel_id`, `room_id`, `department`, `status`. |
| `lib/admin-data.js` -> `ALL_ROOM_INVOICES` | `INV-204-8902` | `Invoice` + `Folio` + `FolioCharge` | Dynamic calculation with immutable stored snapshot. |
| `lib/admin-data.js` -> `SERVICE_CATALOG` | Items `f-1`, `l-1`, etc. | `Service` + `ServiceCategory` | Stable codes, boolean flags for `active` vs `available`. |
| `context/AppContext.js` -> `cartItems` | In-memory cart array | `Cart` + `CartItem` | Attached to `GuestSession` via secure hashed QR token. |
| `components/services/FoodService.js` | South Indian, Chinese, etc. | `ServiceCategory` + `Service` + `FoodMenuItem` | Full support for `VEG`, `NON_VEG`, `JAIN`. |
| `components/cab/CabService.js` | Sedan, SUV, Chauffeur | `Service` (`category: CAB`) | Pickup, destination, and vehicle capacity. |
| `components/store/Store.js` | Boutique gifts | `Product` | Retail inventory with SKU and stock tracking. |
