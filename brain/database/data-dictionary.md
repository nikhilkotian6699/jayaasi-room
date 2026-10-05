# Jayaasi Rooms — Data Dictionary

This document details every table, column, data type, nullability, defaults, enums, and business constraints.

---

## 1. Enums

### `RoomStatus`
- `AVAILABLE`: Ready for guest check-in.
- `OCCUPIED`: Currently assigned to an active stay.
- `CLEANING`: Housekeeping in progress.
- `MAINTENANCE`: Blocked for maintenance/repair.
- `OUT_OF_SERVICE`: Decommissioned.

### `HousekeepingStatus`
- `CLEAN`: Room is verified clean and inspected.
- `DIRTY`: Requires cleaning (e.g., post check-out).
- `IN_PROGRESS`: Cleaner currently in room.
- `INSPECTED`: Supervisor verified.

### `StayStatus`
- `RESERVED`: Booking confirmed, arrival pending.
- `CHECKED_IN`: Guest currently occupying room.
- `CHECKED_OUT`: Guest departed, folio settled.
- `CANCELLED`: Reservation cancelled before arrival.

### `StaffRole`
- `SUPER_ADMIN`: Full system platform owner.
- `HOTEL_ADMIN`: Hotel general manager / property owner.
- `MANAGER`: Operations manager (Arjun Kumar).
- `RECEPTION`: Front desk / check-in desk.
- `HOUSEKEEPING`: Cleaning & turn-down staff.
- `KITCHEN`: Executive chef / in-room dining team.
- `LAUNDRY`: Fabric care & pressing team.
- `CONCIERGE`: Front porch / luggage / tour desk.
- `CAB_OPERATOR`: Chauffeur & fleet coordination.
- `STAFF`: General hotel associate.

### `OrderStatus`
- `DRAFT`: In-progress order not yet committed.
- `CONFIRMED`: Guest committed, billed to room or pending payment.
- `IN_PROGRESS`: Kitchen/services preparing.
- `READY`: Ready for delivery to suite.
- `COMPLETED`: Delivered to guest.
- `CANCELLED`: Voided or rejected.

### `RequestStatus`
- `NEW`: Dispatched, waiting for department pickup.
- `ACCEPTED`: Staff acknowledged.
- `IN_PROGRESS`: Being fulfilled.
- `READY`: Prepared.
- `COMPLETED`: Delivered / closed.
- `CANCELLED`: Voided.

### `Department`
- `KITCHEN`: Food & beverage, bar.
- `HOUSEKEEPING`: Linens, towels, water, cleaning.
- `LAUNDRY`: Pressing, dry cleaning, garment care.
- `BELL_DESK`: Luggage handling, arrival/departure bags.
- `TRANSPORT`: Private cabs, airport transfers.
- `CONCIERGE`: Shoe care, tour bookings, front desk.
- `RETAIL`: Boutique store orders.

### `FolioStatus`
- `OPEN`: Actively accruing room charges.
- `SETTLED`: Fully paid and balanced to zero.
- `VOID`: Voided ledger.
- `CLOSED`: Archived post check-out.

### `PaymentStatus`
- `PENDING`: Awaiting transaction confirmation.
- `SUCCESS`: Confirmed paid.
- `FAILED`: Declined or gateway error.
- `REFUNDED`: Reversal processed.
- `CANCELLED`: Abandoned.

### `DietaryType`
- `VEG`: Vegetarian.
- `NON_VEG`: Non-vegetarian.
- `JAIN`: Jain vegetarian (no root vegetables).
- `VEGAN`: 100% plant-based.

---

## 2. Table Specifications

### Table: `hotels`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique hotel identifier. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Brand display name ("Jayaasi Rooms"). |
| `slug` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | URL-safe slug ("jayaasi-rooms"). |
| `code` | `VARCHAR(20)` | `NOT NULL, UNIQUE` | Short reference code ("JAYAASI-PUNE"). |
| `legal_name` | `VARCHAR(150)` | `NOT NULL` | Registered entity name. |
| `address` | `TEXT` | `NOT NULL` | Street address. |
| `city` | `VARCHAR(100)` | `NOT NULL` | City name ("Pune"). |
| `state` | `VARCHAR(100)` | `NOT NULL` | State ("Maharashtra"). |
| `country` | `VARCHAR(100)` | `NOT NULL, DEFAULT 'India'` | Country. |
| `postal_code` | `VARCHAR(20)` | `NOT NULL` | Postal/PIN code ("411001"). |
| `phone` | `VARCHAR(30)` | `NOT NULL` | Primary contact phone number. |
| `email` | `VARCHAR(150)` | `NOT NULL` | Operations email. |
| `website` | `VARCHAR(255)` | `NULLABLE` | Website URL. |
| `gstin` | `VARCHAR(30)` | `NULLABLE, UNIQUE` | Hotel GST identification number. |
| `currency` | `VARCHAR(10)` | `NOT NULL, DEFAULT 'INR'` | Base billing currency. |
| `timezone` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'Asia/Kolkata'` | Property local timezone. |
| `logo_url` | `VARCHAR(255)` | `NULLABLE` | Brand logo asset path. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active operational status. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Timestamp created. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Timestamp updated. |

### Table: `room_types`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique room type ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel property reference. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Type title ("Business Suite", "Deluxe King"). |
| `code` | `VARCHAR(30)` | `NOT NULL` | Unique code per hotel ("BIZ-STE", "DLX-KNG"). |
| `description` | `TEXT` | `NULLABLE` | Detailed description. |
| `max_adults` | `INT` | `NOT NULL, DEFAULT 2` | Adult capacity. |
| `max_children` | `INT` | `NOT NULL, DEFAULT 1` | Child capacity. |
| `base_price` | `DECIMAL(10,2)` | `NOT NULL` | Base nightly rate (INR). |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active listing. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated timestamp. |
| *Composite* | `UNIQUE(hotel_id, code)` | | Constraint. |

### Table: `rooms`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Room identifier. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Parent hotel. |
| `room_type_id` | `UUID` | `NOT NULL, FK -> room_types(id)` | Associated category. |
| `floor` | `VARCHAR(20)` | `NOT NULL` | Floor designation ("Floor 2", "Floor 3"). |
| `room_number` | `VARCHAR(20)` | `NOT NULL` | Room number string ("204", "301"). |
| `display_name` | `VARCHAR(100)` | `NOT NULL` | Display name ("Suite 204"). |
| `status` | `RoomStatus` | `NOT NULL, DEFAULT 'AVAILABLE'` | Operational occupancy state. |
| `housekeeping_status` | `HousekeepingStatus` | `NOT NULL, DEFAULT 'CLEAN'` | Housekeeping readiness. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active inventory flag. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |
| *Composite* | `UNIQUE(hotel_id, room_number)` | | Scoped room uniqueness. |

### Table: `guests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Guest identifier. |
| `first_name` | `VARCHAR(60)` | `NOT NULL` | First name ("Ananya"). |
| `last_name` | `VARCHAR(60)` | `NOT NULL` | Last name ("Mehta"). |
| `email` | `VARCHAR(150)` | `NULLABLE` | Email address. |
| `phone` | `VARCHAR(30)` | `NOT NULL` | Mobile phone number ("+91 98765 43210"). |
| `country_code` | `VARCHAR(10)` | `NOT NULL, DEFAULT '+91'` | Dialing code. |
| `vip` | `BOOLEAN` | `NOT NULL, DEFAULT false` | VIP guest designation. |
| `notes` | `TEXT` | `NULLABLE` | Guest preferences and allergy notes. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Registered date. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated date. |

### Table: `staff_users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Staff identifier. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel affiliation. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Employee full name ("Arjun Kumar"). |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | Login/work email. |
| `phone` | `VARCHAR(30)` | `NULLABLE` | Direct contact phone. |
| `role` | `StaffRole` | `NOT NULL, DEFAULT 'STAFF'` | Access control role. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Employment status. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |

### Table: `stays`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Stay reservation ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel reference. |
| `guest_id` | `UUID` | `NOT NULL, FK -> guests(id)` | Primary registered guest. |
| `room_id` | `UUID` | `NOT NULL, FK -> rooms(id)` | Assigned room. |
| `booking_reference` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | PNR/Booking code ("BK-2026-20401"). |
| `check_in_at` | `TIMESTAMPTZ` | `NOT NULL` | Check-in timestamp. |
| `expected_check_out_at`| `TIMESTAMPTZ` | `NOT NULL` | Scheduled check-out timestamp. |
| `actual_check_out_at` | `TIMESTAMPTZ` | `NULLABLE` | Departure timestamp. |
| `status` | `StayStatus` | `NOT NULL, DEFAULT 'CHECKED_IN'` | Stay lifecycle state. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |

### Table: `guest_sessions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Session ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `stay_id` | `UUID` | `NOT NULL, FK -> stays(id)` | Current active stay. |
| `room_id` | `UUID` | `NOT NULL, FK -> rooms(id)` | Bound room. |
| `guest_id` | `UUID` | `NOT NULL, FK -> guests(id)` | Guest user. |
| `token_hash` | `VARCHAR(128)` | `NOT NULL, UNIQUE` | SHA-256 hashed QR session token. |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Session expiration. |
| `revoked_at` | `TIMESTAMPTZ` | `NULLABLE` | Revocation time if forced out. |
| `last_seen_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Heartbeat timestamp. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Session start. |

### Table: `service_categories`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Category ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Title ("Food & Drinks", "Housekeeping"). |
| `code` | `VARCHAR(30)` | `NOT NULL` | Unique code ("FOOD", "HOUSEKEEPING", "CAB"). |
| `description` | `TEXT` | `NULLABLE` | Subtitle description. |
| `display_order` | `INT` | `NOT NULL, DEFAULT 0` | UI sort rank. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active flag. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |
| *Composite* | `UNIQUE(hotel_id, code)` | | Unique code per hotel. |

### Table: `services`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Service ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `category_id` | `UUID` | `NOT NULL, FK -> service_categories(id)` | Category link. |
| `name` | `VARCHAR(120)` | `NOT NULL` | Item title ("Vegetable Fried Rice"). |
| `code` | `VARCHAR(40)` | `NOT NULL` | Internal SKU/code ("FOOD-VFR-01"). |
| `description` | `TEXT` | `NULLABLE` | Description. |
| `price` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0.00` | Price in INR. |
| `tax_code` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'GST-5'` | Tax rate code reference. |
| `image_url` | `VARCHAR(255)` | `NULLABLE` | Image path. |
| `department` | `Department` | `NOT NULL` | Target dispatch department. |
| `display_order` | `INT` | `NOT NULL, DEFAULT 0` | UI sequence. |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Exists in catalog. |
| `available` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Currently in-stock / orderable. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |
| *Composite* | `UNIQUE(hotel_id, code)` | | Constraint. |

### Table: `food_menu_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Menu extension ID. |
| `service_id` | `UUID` | `NOT NULL, UNIQUE, FK -> services(id)` | 1-to-1 relation with Service. |
| `dietary_type` | `DietaryType` | `NOT NULL, DEFAULT 'VEG'` | Dietary classification. |
| `spice_level` | `INT` | `NOT NULL, DEFAULT 1` | 0 (Mild) to 3 (Very Spicy). |
| `prep_time_minutes` | `INT` | `NOT NULL, DEFAULT 20` | Kitchen estimated prep time. |
| `sub_cuisine` | `VARCHAR(50)` | `NULLABLE` | "South Indian", "Chinese", "Arabian". |

### Table: `products` (Jayaasi Store)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Product ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel reference. |
| `category_id` | `UUID` | `NULLABLE, FK -> service_categories(id)` | Store category. |
| `name` | `VARCHAR(120)` | `NOT NULL` | Product name ("Silk Artisan Stole"). |
| `sku` | `VARCHAR(50)` | `NOT NULL` | Unique stock SKU. |
| `description` | `TEXT` | `NULLABLE` | Product details. |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Retail price in INR. |
| `stock_quantity`| `INT` | `NOT NULL, DEFAULT 0` | Current inventory count. |
| `available` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Orderable flag. |
| `image_url` | `VARCHAR(255)` | `NULLABLE` | Image path. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |
| *Composite* | `UNIQUE(hotel_id, sku)` | | SKU uniqueness per hotel. |

### Table: `carts`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Cart ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `guest_session_id` | `UUID`| `NOT NULL, FK -> guest_sessions(id)` | Bound guest session. |
| `special_instructions` | `TEXT` | `NULLABLE` | Special dining/delivery notes. |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Auto-cleanup timestamp. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated. |

### Table: `cart_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Cart item ID. |
| `cart_id` | `UUID` | `NOT NULL, FK -> carts(id) ON DELETE CASCADE` | Parent cart. |
| `service_id` | `UUID` | `NULLABLE, FK -> services(id)` | Ordered service reference. |
| `product_id` | `UUID` | `NULLABLE, FK -> products(id)` | Ordered boutique product reference. |
| `quantity` | `INT` | `NOT NULL, DEFAULT 1` | Item count (>= 1). |
| `unit_price_snapshot` | `DECIMAL(10,2)` | `NOT NULL` | Frozen price at cart addition. |
| `notes` | `TEXT` | `NULLABLE` | Line-item custom note. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |

### Table: `orders`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Order ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `stay_id` | `UUID` | `NOT NULL, FK -> stays(id)` | Active stay. |
| `guest_id` | `UUID` | `NOT NULL, FK -> guests(id)` | Guest. |
| `room_id` | `UUID` | `NOT NULL, FK -> rooms(id)` | Suite billed to. |
| `order_number` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Display order number ("ORD-2026-1042"). |
| `status` | `OrderStatus` | `NOT NULL, DEFAULT 'CONFIRMED'` | Order fulfillment state. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL` | Subtotal excl. taxes. |
| `tax_total` | `DECIMAL(10,2)` | `NOT NULL` | Total GST tax amount. |
| `discount_total`| `DECIMAL(10,2)`| `NOT NULL, DEFAULT 0.00` | Discount applied. |
| `grand_total` | `DECIMAL(10,2)` | `NOT NULL` | Total order amount. |
| `notes` | `TEXT` | `NULLABLE` | Guest special instructions. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |

### Table: `order_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Line item ID. |
| `order_id` | `UUID` | `NOT NULL, FK -> orders(id) ON DELETE RESTRICT` | Parent order. |
| `service_id` | `UUID` | `NULLABLE, FK -> services(id)` | Service reference. |
| `product_id` | `UUID` | `NULLABLE, FK -> products(id)` | Product reference. |
| `name_snapshot` | `VARCHAR(120)` | `NOT NULL` | Frozen item title. |
| `quantity` | `INT` | `NOT NULL` | Units ordered. |
| `unit_price` | `DECIMAL(10,2)` | `NOT NULL` | Frozen unit price. |
| `tax_rate` | `DECIMAL(5,2)` | `NOT NULL, DEFAULT 5.00` | Frozen tax percentage (5%). |
| `tax_amount` | `DECIMAL(10,2)` | `NOT NULL` | Calculated tax. |
| `line_total` | `DECIMAL(10,2)` | `NOT NULL` | `(quantity * unit_price) + tax_amount`. |

### Table: `service_requests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Request ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel reference. |
| `stay_id` | `UUID` | `NOT NULL, FK -> stays(id)` | Stay context. |
| `room_id` | `UUID` | `NOT NULL, FK -> rooms(id)` | Target room. |
| `guest_id` | `UUID` | `NOT NULL, FK -> guests(id)` | Requesting guest. |
| `order_id` | `UUID` | `NULLABLE, FK -> orders(id)` | Associated order (if billed). |
| `service_id` | `UUID` | `NULLABLE, FK -> services(id)` | Specific service requested. |
| `request_number` | `VARCHAR(50)`| `NOT NULL, UNIQUE` | Code ("REQ-1042"). |
| `department` | `Department` | `NOT NULL` | Assigned department. |
| `status` | `RequestStatus` | `NOT NULL, DEFAULT 'NEW'` | Operational progress state. |
| `priority` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'NORMAL'` | 'NORMAL', 'URGENT', 'VIP'. |
| `assigned_staff_id`| `UUID` | `NULLABLE, FK -> staff_users(id)` | Assigned team member. |
| `requested_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Ticket opened. |
| `accepted_at` | `TIMESTAMPTZ` | `NULLABLE` | Ticket accepted. |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Ticket fulfilled. |
| `notes` | `TEXT` | `NULLABLE` | Guest / internal instructions. |

### Table: `folios`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Master folio ledger ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `stay_id` | `UUID` | `NOT NULL, UNIQUE, FK -> stays(id)` | 1-to-1 active stay billing ledger. |
| `folio_number` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Folio code ("FOLIO-2026-204"). |
| `status` | `FolioStatus` | `NOT NULL, DEFAULT 'OPEN'` | Ledger status. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0.00` | Aggregated charge subtotals. |
| `tax_total` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0.00` | Aggregated taxes. |
| `discount_total`| `DECIMAL(10,2)`| `NOT NULL, DEFAULT 0.00` | Applied discounts. |
| `grand_total` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0.00` | Current balance due. |
| `settled_at` | `TIMESTAMPTZ` | `NULLABLE` | Settlement timestamp. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Updated at. |

### Table: `folio_charges`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Charge ID. |
| `folio_id` | `UUID` | `NOT NULL, FK -> folios(id) ON DELETE RESTRICT` | Parent folio ledger. |
| `order_id` | `UUID` | `NULLABLE, FK -> orders(id)` | Originating guest order. |
| `category` | `VARCHAR(50)` | `NOT NULL` | "Room Tariff", "In-Room Dining", "Laundry". |
| `description` | `VARCHAR(200)` | `NOT NULL` | Item description. |
| `quantity` | `INT` | `NOT NULL, DEFAULT 1` | Units charged. |
| `unit_price` | `DECIMAL(10,2)` | `NOT NULL` | Unit rate before tax. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL` | `quantity * unit_price`. |
| `tax` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0.00` | CGST + SGST tax on charge. |
| `total` | `DECIMAL(10,2)` | `NOT NULL` | Final line total (`subtotal + tax`). |
| `posted_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Time charged to suite. |

### Table: `invoices`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Invoice ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `stay_id` | `UUID` | `NOT NULL, FK -> stays(id)` | Stay reference. |
| `folio_id` | `UUID` | `NOT NULL, FK -> folios(id)` | Master folio snapshot. |
| `invoice_number` | `VARCHAR(50)`| `NOT NULL, UNIQUE` | Official GST invoice code ("INV-204-8902"). |
| `invoice_date` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Invoicing date. |
| `subtotal` | `DECIMAL(10,2)` | `NOT NULL` | Pre-tax subtotal. |
| `cgst` | `DECIMAL(10,2)` | `NOT NULL` | Central GST (2.5%). |
| `sgst` | `DECIMAL(10,2)` | `NOT NULL` | State GST (2.5%). |
| `grand_total` | `DECIMAL(10,2)` | `NOT NULL` | Grand total payable. |
| `status` | `VARCHAR(30)` | `NOT NULL, DEFAULT 'ISSUED'` | "ISSUED", "PAID", "VOID". |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Generated timestamp. |

### Table: `payments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Payment record ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel reference. |
| `stay_id` | `UUID` | `NOT NULL, FK -> stays(id)` | Stay reference. |
| `folio_id` | `UUID` | `NOT NULL, FK -> folios(id)` | Folio reference. |
| `invoice_id` | `UUID` | `NULLABLE, FK -> invoices(id)` | Billed invoice. |
| `amount` | `DECIMAL(10,2)` | `NOT NULL` | Amount paid. |
| `currency` | `VARCHAR(10)` | `NOT NULL, DEFAULT 'INR'` | Currency code. |
| `method` | `VARCHAR(40)` | `NOT NULL` | "CREDIT_CARD", "UPI", "CASH", "DIRECT_BILL". |
| `provider` | `VARCHAR(40)` | `NULLABLE` | "RAZORPAY", "STRIPE", "PMS_CASH". |
| `provider_reference` | `VARCHAR(100)` | `NULLABLE` | Gateway transaction ID. |
| `status` | `PaymentStatus` | `NOT NULL, DEFAULT 'SUCCESS'` | Payment result. |
| `paid_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Recorded time. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Created at. |

### Table: `tax_configs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Tax rate ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `tax_code` | `VARCHAR(30)` | `NOT NULL` | "GST-5", "GST-12", "GST-18". |
| `name` | `VARCHAR(100)` | `NOT NULL` | "Hospitality Room & Food GST (5%)". |
| `total_rate` | `DECIMAL(5,2)` | `NOT NULL, DEFAULT 5.00` | 5.00%. |
| `cgst_rate` | `DECIMAL(5,2)` | `NOT NULL, DEFAULT 2.50` | 2.50%. |
| `sgst_rate` | `DECIMAL(5,2)` | `NOT NULL, DEFAULT 2.50` | 2.50%. |
| `igst_rate` | `DECIMAL(5,2)` | `NOT NULL, DEFAULT 0.00` | 0.00% (Interstate). |
| `active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Active rule. |
| `effective_date`| `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Start date. |
| *Composite* | `UNIQUE(hotel_id, tax_code)` | | Unique code per hotel. |

### Table: `notifications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Notification ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `recipient_type` | `VARCHAR(20)` | `NOT NULL` | 'GUEST' or 'STAFF'. |
| `guest_id` | `UUID` | `NULLABLE, FK -> guests(id)` | Guest recipient. |
| `staff_user_id` | `UUID`| `NULLABLE, FK -> staff_users(id)` | Staff recipient. |
| `type` | `VARCHAR(50)` | `NOT NULL` | 'ORDER_CONFIRMED', 'CAB_ASSIGNED'. |
| `title` | `VARCHAR(120)` | `NOT NULL` | Heading. |
| `message` | `TEXT` | `NOT NULL` | Message body. |
| `read_at` | `TIMESTAMPTZ` | `NULLABLE` | Read receipt timestamp. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Dispatched at. |

### Table: `audit_logs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Log ID. |
| `hotel_id` | `UUID` | `NOT NULL, FK -> hotels(id)` | Hotel. |
| `actor_user_id`| `UUID` | `NULLABLE, FK -> staff_users(id)` | Staff who initiated action. |
| `action` | `VARCHAR(80)` | `NOT NULL` | "ROOM_STATUS_CHANGE", "FOLIO_SETTLED". |
| `entity_type` | `VARCHAR(60)` | `NOT NULL` | "Room", "Folio", "Order". |
| `entity_id` | `VARCHAR(60)` | `NOT NULL` | Target record UUID/ID. |
| `old_value` | `JSONB` | `NULLABLE` | Pre-change JSON snapshot. |
| `new_value` | `JSONB` | `NULLABLE` | Post-change JSON snapshot. |
| `ip_address` | `VARCHAR(50)` | `NULLABLE` | Actor IP. |
| `user_agent` | `VARCHAR(255)` | `NULLABLE` | Browser user-agent. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT now()` | Event timestamp. |
