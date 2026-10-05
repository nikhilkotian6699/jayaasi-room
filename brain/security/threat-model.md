# Threat Model — Jayaasi Rooms Application

## 1. Executive Summary
This threat model evaluates the current architecture, implementation, and deployment configuration of the **Jayaasi Rooms / Business Suite** application. The system is built with **Next.js 16.3.6** (Turbopack, App Router) and **React 19.2.8**. At its current stage, the application operates primarily as a client-side frontend prototype relying on in-memory mock data store (`lib/mock-data.js`) and client React Context (`context/AppContext.js`). There is no persistent database backend, no server-side authentication validation, and no authorization middleware.

---

## 2. System Architecture & Context

```
                         [ UNTRUSTED NETWORK / INTERNET ]
                                        │
                                        ▼
                  ┌──────────────────────────────────────────┐
                  │ Next.js Web Server (Port 3000 / 3001)    │
                  │ - Serves static chunks & SSR HTML        │
                  │ - No middleware / No server-side auth    │
                  └─────────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌──────────────────┐           ┌──────────────────┐
│ Guest Portal    │            │ Staff Portal     │           │ Admin Panel      │
│ - Room 204      │            │ - /staff         │           │ - /admin         │
│ - Order Food    │            │ - Orders review  │           │ - Settings       │
│ - Services      │            │ - Requests queue │           │ - Staff access   │
│ - Client Auth   │            │ (No Auth Guard)  │           │ (No Auth Guard)  │
└────────┬────────┘            └────────┬─────────┘           └────────┬─────────┘
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        ▼
                  ┌──────────────────────────────────────────┐
                  │ Client-Side State & Mock Store           │
                  │ - context/AppContext.js (React State)    │
                  │ - lib/mock-data.js (Static Objects)      │
                  │   * Guest Names, Room Numbers, PII       │
                  │   * Staff Directory & Email Addresses    │
                  │   * Hotel Wi-Fi Credentials              │
                  └──────────────────────────────────────────┘
```

---

## 3. Assets

| Asset ID | Asset Description | Sensitivity | Location | Impact if Compromised |
| :--- | :--- | :--- | :--- | :--- |
| **AST-01** | **Guest Personally Identifiable Information (PII)**: Full names (e.g., Ananya Mehta, Rahul Shah, Priya Nair), phone numbers, email addresses. | **High** | `lib/mock-data.js`, `context/AppContext.js`, Client bundles | Breach of guest privacy, impersonation, phishing, regulatory non-compliance (DPDP Act / GDPR). |
| **AST-02** | **Room & Stay Details**: Room numbers (101–303), occupancy status, check-in/out schedules, floor allocation. | **Medium** | `lib/mock-data.js`, Client bundles | Physical security risk to hotel occupants, stalking, targeted social engineering. |
| **AST-03** | **Order & Service Request Records**: In-room dining history, baggage requests, housekeeping logs, timestamps. | **Medium** | `lib/mock-data.js`, `orders/page.js` | Privacy violation, operational disruption, unauthorized order modifications. |
| **AST-04** | **Staff Directory & Internal Contact Information**: Full staff names, internal IDs, operational titles, departments, corporate email addresses (`@jayaasi.in`). | **Medium** | `lib/mock-data.js`, `app/admin/staff/page.js` | Targeted spear-phishing against hotel staff, unauthorized administrative access attempts. |
| **AST-05** | **Hotel Infrastructure Credentials (Wi-Fi)**: Hotel Wi-Fi SSID (`Jayaasi_Guest`) and plaintext password (`suite204`). | **Medium-High** | `lib/mock-data.js:20`, `context/AppContext.js:25`, Client DOM | Unauthorized local network access, network sniffing, man-in-the-middle attacks against hotel guests. |
| **AST-06** | **Hotel Management & Configuration Settings**: Room rates, operational hours, guest experience toggles (QR access, verification). | **Medium** | `app/admin/settings/page.js`, `lib/mock-data.js` | Fraudulent configuration changes, pricing sabotage, disruption of hotel operations. |

---

## 4. Trust Boundaries

1. **Boundary 1: External Client Browser vs. Web Server**
   - *Description*: Any external HTTP client connecting over port 3000/3001. All requests across this boundary must be treated as completely untrusted.
2. **Boundary 2: Public Guest Portal vs. Staff Workspace (`/staff`)**
   - *Description*: The boundary separating guest service selection from staff internal fulfillment queues.
   - *Current Status*: **Non-existent / Broken**. No authorization boundary separates `/staff` from public routes.
3. **Boundary 3: Public Guest Portal vs. Administrative Management (`/admin`)**
   - *Description*: The boundary separating guest interaction from hotel-wide master control, staff user management, and room configs.
   - *Current Status*: **Non-existent / Broken**. Direct URL navigation permits anyone to load the admin console.
4. **Boundary 4: Unauthenticated Guest vs. Verified Guest**
   - *Description*: The boundary intended to ensure that only the occupant of a specific room can place orders and bill services to that room.
   - *Current Status*: **Client-Simulated Only**. Client state toggles `isAuthenticated = true` after a timer; no cryptographic session or server verification exists.

---

## 5. Actors & Threat Profiles

| Actor | Access Level | Motivation | Capabilities |
| :--- | :--- | :--- | :--- |
| **External Internet User** | Public / Unauthenticated | Data harvesting, mischief, defacement | Direct web requests, parameter manipulation, inspection of client JS bundles. |
| **In-Room Hotel Guest** | Physical room QR code | Convenience, curiosity, accidental abuse | Interacts via mobile interface, can modify URL parameters to access other rooms or admin routes. |
| **Malicious Guest / Attacker** | Network / Local Wi-Fi access | Financial gain, identity theft, denial of service | Inspects client-side source code, extracts hardcoded credentials, accesses staff/admin routes, places fraudulent orders. |
| **Hotel Staff Member** | Department access | Operational fulfillment | Could exceed intended department boundaries (e.g. housekeeping staff viewing executive admin panel). |
| **Hotel Administrator** | Full platform access | Property management | Legitimate administrator requiring privileged security controls. |

---

## 6. Entry Points

| Entry Point | Path / Method | Protocol | Target Handler | Trust Level |
| :--- | :--- | :--- | :--- | :--- |
| **Root Guest Dashboard** | `/` (GET) | HTTP/HTTPS | `app/page.js` (`HomeView`) | Untrusted |
| **Dynamic Room URL** | `/:hotelSlug/:roomId` (GET) | HTTP/HTTPS | `app/(guest)/[hotelSlug]/[roomId]/page.js` | Untrusted |
| **Service Catalog** | `/services` (GET) | HTTP/HTTPS | `app/services/page.js` (`ServicesGrid`) | Untrusted |
| **Order Food Screen** | `/services/food` (GET) | HTTP/HTTPS | `app/services/food/page.js` (`FoodService`) | Untrusted |
| **Housekeeping Screen** | `/services/housekeeping` (GET) | HTTP/HTTPS | `app/services/housekeeping/page.js` | Untrusted |
| **Laundry Services** | `/services/laundry` (GET) | HTTP/HTTPS | `app/services/laundry/page.js` | Untrusted |
| **Shoe Care Screen** | `/services/shoe-care` (GET) | HTTP/HTTPS | `app/services/shoe-care/page.js` | Untrusted |
| **Luggage Handling** | `/services/luggage` (GET) | HTTP/HTTPS | `app/services/luggage/page.js` | Untrusted |
| **Cab Booking Screen** | `/cab` (GET) | HTTP/HTTPS | `app/cab/page.js` (`CabService`) | Untrusted |
| **Room Information** | `/room` (GET) | HTTP/HTTPS | `app/room/page.js` (`RoomInformation`) | Untrusted |
| **Jayaasi Store** | `/store` (GET) | HTTP/HTTPS | `app/store/page.js` (`Store`) | Untrusted |
| **Travel Guide** | `/travel` (GET) | HTTP/HTTPS | `app/travel/page.js` (`TravelPlaces`) | Untrusted |
| **Staff Portal Root** | `/staff` (GET) | HTTP/HTTPS | `app/staff/page.js` | Untrusted (No Auth) |
| **Staff Orders Queue** | `/staff/orders` (GET) | HTTP/HTTPS | `app/staff/orders/page.js` | Untrusted (No Auth) |
| **Staff Requests Queue**| `/staff/requests` (GET) | HTTP/HTTPS | `app/staff/requests/page.js` | Untrusted (No Auth) |
| **Admin Overview** | `/admin` (GET) | HTTP/HTTPS | `app/admin/page.js` | Untrusted (No Auth) |
| **Admin Settings** | `/admin/settings` (GET) | HTTP/HTTPS | `app/admin/settings/page.js` | Untrusted (No Auth) |
| **Admin Staff Mgmt** | `/admin/staff` (GET) | HTTP/HTTPS | `app/admin/staff/page.js` | Untrusted (No Auth) |
| **Admin Analytics** | `/admin/analytics` (GET) | HTTP/HTTPS | `app/admin/analytics/page.js` | Untrusted (No Auth) |
| **Client Input: Auth Phone** | Form input | Client DOM | `AuthModal.js` | Untrusted |
| **Client Input: Auth Email** | Form input | Client DOM | `AuthModal.js` | Untrusted |
| **Client Input: Cart Notes** | Textarea | Client DOM | `ServiceCartBottomSheet.js` | Untrusted |
| **Client Input: Cab Destination**| Form input / query string | Client DOM | `CabService.js` | Untrusted |

---

## 7. STRIDE Threat Analysis

### 7.1. Spoofing
- **Threat T-01: Guest Identity Spoofing**
  - *Description*: Any user can manually change the room ID in the URL (e.g., from `/jayaasi-rooms/204` to `/jayaasi-rooms/101`) or enter arbitrary phone numbers in `AuthModal.js`. Since verification is simulated client-side (`setTimeout`), an attacker can spoof any guest account without a cryptographic challenge.
  - *Risk*: **High**

### 7.2. Tampering
- **Threat T-02: Client-Side Cart & Pricing Tampering**
  - *Description*: Cart item prices, quantities, and totals are computed strictly in browser memory (`context/AppContext.js`). An attacker using browser DevTools or console commands can alter `item.price = 0` or change quantities to negative values before triggering requests.
  - *Risk*: **High** (upon backend integration)

### 7.3. Repudiation
- **Threat T-03: Lack of Server-Side Audit Logs for Operations**
  - *Description*: Hotel service requests, check-in confirmations, order submittals, and staff assignment actions have no immutable server-side audit logs. An actor can dispute orders or staff can dispute request handling without non-repudiation controls.
  - *Risk*: **Medium**

### 7.4. Information Disclosure
- **Threat T-04: Full PII & Wi-Fi Credential Leakage in Client Bundles**
  - *Description*: The file `lib/mock-data.js` contains 12 guest profiles, 5 staff accounts with corporate emails, occupancy details, and the hotel Wi-Fi password. Because it is imported into client components (`GuestHeader`, `SettingsPage`, `StaffPage`), Turbopack bundles these objects directly into client-accessible JavaScript.
  - *Risk*: **High**

### 7.5. Denial of Service
- **Threat T-05: Client Resource Exhaustion & Unbounded State Expansion**
  - *Description*: Cart items and form submissions have no client-side size restrictions or server-side rate limits. Repeated submissions can trigger excessive DOM nodes or memory pressure.
  - *Risk*: **Low-Medium**

### 7.6. Elevation of Privilege
- **Threat T-06: Unauthenticated Access to Administrative & Staff Portals**
  - *Description*: The administrative interface (`/admin/*`) and staff fulfillment interface (`/staff/*`) have no server-side middleware, HTTP-only cookie checks, or session requirements. Any anonymous internet user can directly navigate to `/admin/staff` or `/admin/settings` and inspect or trigger management views.
  - *Risk*: **Critical**

---

## 8. Detailed Attack Scenarios

### Attack Scenario 1: Unauthorized Administrative Reconnaissance & Setting Manipulation
1. **Attacker Action**: An anonymous web user navigates directly to `http://localhost:3000/admin/staff` and `http://localhost:3000/admin/settings`.
2. **System Response**: Because `app/admin/layout.js` only checks `usePathname()` for styling and contains no session verification, the server returns the full admin shell.
3. **Outcome**: The attacker views the entire hotel roster (names, roles, corporate email addresses) and hotel operational parameters without ever presenting credentials.
4. **Severity**: **Critical**

### Attack Scenario 2: Wi-Fi Credential Extraction & Local Network Infiltration
1. **Attacker Action**: An external attacker visits the public guest page `http://localhost:3000/room` or inspects the compiled JavaScript chunk containing `lib/mock-data.js`.
2. **System Response**: The component renders the Wi-Fi network `Jayaasi_Guest` and reveals password `suite204` via the UI and DOM.
3. **Outcome**: The attacker connects to the internal property network without authorization, potentially intercepting unencrypted guest traffic or attacking internal hotel equipment (printers, POS, PBX).
4. **Severity**: **High**

### Attack Scenario 3: Cross-Room Impersonation & Unauthorized Service Requests
1. **Attacker Action**: A guest staying in Room 102 changes their browser URL to `/jayaasi-rooms/204` and submits multiple high-value room dining orders.
2. **System Response**: The frontend updates context to Room 204. `AuthModal.js` allows entering any phone number and completes verification automatically.
3. **Outcome**: Orders are falsely billed to Room 204's occupant without authentication or verification of physical room possession.
4. **Severity**: **High**

---

## 9. Risk Summary Matrix

| ID | Finding Title | STRIDE Category | Impact | Likelihood | Risk Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-TM-01** | Missing Authentication on `/admin` and `/staff` Routes | Elevation of Privilege | High | High | **CRITICAL** |
| **SEC-TM-02** | Exposure of PII and Wi-Fi Passwords in Client Bundles | Information Disclosure | High | High | **HIGH** |
| **SEC-TM-03** | Client-Only Verification Loop in Authentication Modal | Spoofing | High | High | **HIGH** |
| **SEC-TM-04** | Client-Side Price and Cart Calculation without Server Validation | Tampering | High | Medium | **HIGH** |
| **SEC-TM-05** | Missing Security Headers & CSP in `next.config.mjs` | Information Disclosure / XSS | Medium | High | **MEDIUM** |
| **SEC-TM-06** | Absence of Server-Side Rate Limiting | Denial of Service | Medium | Medium | **MEDIUM** |

---

## 10. Existing Mitigations vs. Missing Mitigations

### 10.1. Existing Mitigations (Verified in Codebase)
- **Framework Auto-Escaping**: React 19 JSX natively escapes dynamic expressions in components (e.g. `{room.guest}`, `{dish.name}`), mitigating basic reflected XSS via standard text nodes.
- **Controlled Component Inputs**: Inputs in `AuthModal.js` and `CabService.js` use React state controlled bindings rather than raw `innerHTML` or `dangerouslySetInnerHTML`.
- **Private Environment Ignoring**: `.gitignore` explicitly includes `.env*` to prevent accidental commits of local environment files.
- **Image Domain Isolation**: `next.config.mjs` uses standard Next.js image loading without permissive external image domains configured.

### 10.2. Missing Mitigations (Required for Production)
- **Next.js Edge / Server Middleware**: No `middleware.js` to guard `/admin/*` and `/staff/*` with session tokens or JWT cookies.
- **Backend Authentication Service**: No backend API to handle real SMS/missed-call verification or issue cryptographically signed, HTTP-only session cookies.
- **Data Layer Boundary**: Separation of server-only sensitive data from client bundles. `lib/mock-data.js` currently ships all data to the browser.
- **Server-Side Validation**: Server endpoints validating prices against an authoritative product catalog.
- **HTTP Security Headers**: Missing `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, and `X-Content-Type-Options` in `next.config.mjs`.
