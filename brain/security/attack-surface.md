# Attack Surface Analysis — Jayaasi Rooms

## 1. Overview
This document analyzes the complete attack surface of the **Jayaasi Rooms** application. It examines all publicly reachable web endpoints, internal interfaces, input vectors, authentication surfaces, administrative panels, third-party integrations, and dependency risks based on the current codebase.

---

## 2. Attack Surface Breakdown

```
                             [ ATTACK SURFACE TAXONOMY ]
                                          │
    ┌───────────────────┬─────────────────┼──────────────────┬─────────────────┐
    ▼                   ▼                 ▼                  ▼                 ▼
[Public Endpoints] [Admin/Staff]   [Input Vectors]   [Third-Party]      [Dependencies]
- / (Guest Home)   - /admin        - Phone/Email     - Uber / Ola       - Next.js 16.3.6
- /services/*      - /admin/staff  - Textareas       - Phone dialers    - React 19.2.8
- /cab, /room      - /staff        - URL params      - External fonts   - ESLint 9
- /store, /travel  - /staff/orders - Search inputs   - Google CDN
```

---

## 3. Public Web Endpoints

The following routes are completely open and accessible to any unauthenticated client on the network:

| Route Path | Associated Component | Input Parameters | Authentication Required | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.js` (`HomeView`) | None | None | Low |
| `/:hotelSlug/:roomId` | `app/(guest)/[hotelSlug]/[roomId]/page.js` | `hotelSlug`, `roomId` path parameters | None | Medium (Insecure Direct Object Reference) |
| `/services` | `app/services/page.js` (`ServicesGrid`) | None | None | Low |
| `/services/food` | `app/services/food/page.js` (`FoodService`) | Search query string, dish quantity steppers | None | Low |
| `/services/housekeeping` | `app/services/housekeeping/page.js` (`HousekeepingService`) | Service checkmark toggles | None | Low |
| `/services/laundry` | `app/services/laundry/page.js` (`LaundryService`) | Service option, garment quantities | None | Low |
| `/services/shoe-care` | `app/services/shoe-care/page.js` (`ShoeCareService`) | Shoe quantities, service type | None | Low |
| `/services/luggage` | `app/services/luggage/page.js` (`LuggageService`) | Service toggles, bag count, fragile flag | None | Low |
| `/cab` | `app/cab/page.js` (`CabService`) | `destination` (query param/input), time, vehicle | None | Low-Medium |
| `/room` | `app/room/page.js` (`RoomInformation`) | None | None | Low |
| `/store` | `app/store/page.js` (`Store`) | Category filter | None | Low |
| `/travel` | `app/travel/page.js` (`TravelPlaces`) | Tag filter | None | Low |

---

## 4. Internal & Administrative Surfaces (Critical Exposure)

Although designed for hotel personnel and administrators, the following internal operational routes are currently **unprotected** by any authentication middleware or session check:

| Route Path | Intended Audience | Content Exposed | Exposed Functionality | Vulnerability Severity |
| :--- | :--- | :--- | :--- | :--- |
| `/admin` | Hotel Admins | Executive overview, occupancy rate, daily order totals | Property overview dashboard | **CRITICAL** |
| `/admin/staff` | Hotel Admins | Staff roster, corporate email addresses, roles, status | "Invite staff", "Edit access", "Manage roles" | **CRITICAL** |
| `/admin/settings` | Hotel Admins | Hotel contact info, Wi-Fi configs, check-in/out hours | "Save changes" setting modifications | **CRITICAL** |
| `/admin/requests` | Hotel Admins | Live guest room requests, guest names, timestamps | Request queue management | **CRITICAL** |
| `/admin/rooms` | Hotel Admins | Room status table (Occupied/Cleaning/Available) | Room inventory tracking | **CRITICAL** |
| `/admin/menu` | Hotel Admins | Dining menu items, prices, availability flags | Menu item CRUD triggers | **CRITICAL** |
| `/admin/qr` | Hotel Admins | Room QR code generation status, download triggers | QR pack generation | **CRITICAL** |
| `/admin/analytics` | Hotel Admins | Weekly occupancy trends, service utilization | Business analytics data | **CRITICAL** |
| `/admin/travel` | Hotel Admins | Curated destination catalog | Travel place configs | **CRITICAL** |
| `/staff` | Department Staff | Active staff dashboard, live order alerts | Operational dispatch | **CRITICAL** |
| `/staff/orders` | Kitchen Staff | In-room dining orders, guest room numbers, items | Kitchen order processing | **CRITICAL** |
| `/staff/requests` | Housekeeping Staff | Active service tickets, room numbers, priorities | Service request triage | **CRITICAL** |

---

## 5. Authentication & Authorization Surfaces

### 5.1. Client-Side Authentication Modal (`AuthModal.js`)
- **Location**: `components/auth/AuthModal.js`
- **Surface**:
  - `phoneInput`: Text input accepting mobile numbers.
  - `emailInput`: Text input accepting email addresses.
  - `otpInput`: 4 individual digit boxes.
- **Exposure / Mechanism**:
  - The verification flow calls `completeVerification()` in `context/AppContext.js` via a client-side timer:
    ```javascript
    const handleVerify = () => {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        completeVerification();
      }, 900);
    };
    ```
  - **No backend network request is dispatched.** Authentication state (`isAuthenticated`) exists only in browser memory and is reset upon page refresh.
  - An attacker can set `isAuthenticated = true` directly via React DevTools or console scripting.

### 5.2. IDOR / Parameter Tampering via Dynamic URL
- **Location**: `app/(guest)/[hotelSlug]/[roomId]/page.js`
- **Surface**: `[roomId]` route parameter.
- **Exposure**:
  - Changing the URL to `/jayaasi-rooms/101`, `/jayaasi-rooms/102`, etc., immediately alters the room context displayed on screen.
  - There is no cryptographic verification (e.g. signed QR token, room check-in code, or session cookie) tying the device to that physical room.

---

## 6. User Input Vectors & Injection Analysis

| Input Location | Component | Input Element | Validation Status | Risk Analysis |
| :--- | :--- | :--- | :--- | :--- |
| **Phone Number** | `AuthModal.js` | `<input type="tel">` | Client `required` attribute only | No server-side regex, E.164 formatting, or rate-limiting. |
| **Email Address** | `AuthModal.js` | `<input type="email">` | Browser email validation only | No RFC 5322 compliance check or MX verification. |
| **OTP Code** | `AuthModal.js` | 4 × `<input type="text">` | `maxLength={1}` | Any value accepted; client auto-approves. |
| **Special Instructions** | `ServiceCartBottomSheet.js` | `<textarea>` | None (unbounded length) | Rendered as text node. No XSS in React, but unbounded string length. |
| **Cab Destination** | `CabService.js` | `<input type="text">` | None | Reflected directly into cart item name (`Cab to ${dropLocation}`). |
| **Destination Query Param** | `TravelPlaces.js` -> `/cab` | `?destination=` URL param | Handled by React state | Injected into destination state; safe from direct DOM injection. |
| **Food Search Query** | `FoodService.js` | `<input type="text">` | `.toLowerCase().includes()` | In-memory string filtering only; safe from SQL/NoSQL injection. |
| **Admin Form Inputs** | `SettingsPage.js`, `StaffPage.js` | `<input defaultValue=...>` | Standard uncontrolled inputs | Unauthenticated input forms; no backend endpoint to exploit yet. |

---

## 7. File Uploads, Database Access & Storage Surfaces

- **File Upload Surfaces**:
  - **Current Status**: **None**. There are zero file upload components or `multipart/form-data` handlers in the application.
  - *Admin QR Download*: The button "Download QR pack" in `SettingsPage.js` triggers an inline mock alert, not a file stream.
- **Database Access Surfaces**:
  - **Current Status**: **None**. No database drivers (PostgreSQL, MySQL, MongoDB, SQLite) or ORMs (Prisma, Drizzle, Mongoose) are installed or imported.
- **Client Storage Surfaces**:
  - **Current Status**: **No LocalStorage or Cookies**.
  - All state resides in volatile React Context memory (`AppContext`). Refreshing the browser resets the session and cart.
  - While this prevents persistent session hijacking via stolen `localStorage` tokens, it prevents persistent login across browser tabs.

---

## 8. Webhooks & Third-Party Integrations

### 8.1. Ride Provider Deep Links
- **Location**: `lib/mock-data.js:167-168`
- **Surface**: References to Uber and Ola.
- **Risk**: If transformed into direct URL schemes without server-side validation, malicious inputs could inject arbitrary deep links or URL schemes (`javascript:`, `data:`).

### 8.2. Telephone Call Protocol (`tel:`)
- **Location**: `MobileHeader.js:77-111`
- **Surface**: `href="tel:0"`, `href="tel:101"`, `href="tel:102"`, `href="tel:9"`.
- **Risk**: Hardcoded internal PBX extensions. Safe from injection, but reveals internal hotel dialing schemes to the public.

### 8.3. External Font CDN
- **Location**: `app/globals.css:1`, `app/(guest)/guest.css:1`
- **Surface**: `@import url('https://fonts.googleapis.com/css2?family=...');`
- **Risk**: Subresource dependency on Google Fonts CDN. If Google Fonts is blocked or manipulated via DNS poisoning, font rendering fails or triggers third-party IP logging.

---

## 9. Network & Deployment Exposure

- **Port Exposure**:
  - Development server binds to `0.0.0.0` or `127.0.0.1` on port 3000 (or 3001 if port 3000 is occupied).
- **HTTP Security Headers**:
  - An inspection of [`next.config.mjs`](file:///Users/nikhilkotian/Desktop/Jayaasi%20/jayaasi-room/next.config.mjs) confirms **no custom HTTP headers** are configured.
  - The application lacks:
    - `Content-Security-Policy` (CSP)
    - `Strict-Transport-Security` (HSTS)
    - `X-Frame-Options` (Clickjacking protection)
    - `X-Content-Type-Options` (MIME-sniffing prevention)
    - `Referrer-Policy`
    - `Permissions-Policy`

---

## 10. Dependency & Supply Chain Surface

An inspection of `package.json` reveals minimal direct dependencies:
```json
{
  "dependencies": {
    "next": "16.3.6",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.3.6"
  }
}
```

### Risk Evaluation:
- **Low Third-Party Dependency Footprint**: Having only 3 production dependencies significantly minimizes supply chain risks compared to applications with dozens of npm packages.
- **Next.js 16.3.6 & React 19.2.8**: Next.js 16.3.6 is a pre-release / canary-level major version. Pre-release major versions may have undiscovered zero-day bugs or rapid security patching cadences.

---

## 11. Specific Findings & Audit Evidence

### 11.1. Confirmed Vulnerability
- **Severity**: **Critical**
- **Evidence**:
  ```javascript
  // File: app/admin/layout.js (lines 25-37)
  export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    // ... No session check, no token verification, no redirect
  ```
- **Risk**: Total unauthenticated exposure of administrative and staff portals to the public internet.
- **Affected Location**: `app/admin/*`, `app/staff/*`.
- **Why It Matters**: Anyone discovering or guessing the `/admin` or `/staff` URLs can view hotel occupancy, guest service requests, room statuses, and internal employee directories.
- **Recommended Fix**: Implement Next.js `middleware.js` to inspect cryptographically signed session cookies before rendering any route under `/admin` or `/staff`, redirecting unauthenticated users to a secure login page.

---

### 11.2. Confirmed Vulnerability
- **Severity**: **High**
- **Evidence**:
  ```javascript
  // File: next.config.mjs (lines 1-97)
  const nextConfig = {
    async rewrites() { ... }
    // No headers() property defined
  };
  ```
- **Risk**: Missing defense-in-depth HTTP security headers (Clickjacking, MIME-sniffing, XSS).
- **Affected Location**: `next.config.mjs`.
- **Why It Matters**: Without `X-Frame-Options: DENY` or `frame-ancestors 'none'`, the guest application can be framed inside a malicious third-party site to conduct clickjacking attacks against guests ordering services or entering phone numbers.
- **Recommended Fix**: Add a `headers()` block in `next.config.mjs` enforcing `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a strict `Content-Security-Policy`.

---

### 11.3. Security Weakness
- **Severity**: **High**
- **Evidence**:
  ```javascript
  // File: app/(guest)/[hotelSlug]/[roomId]/page.js
  export default function GuestHome() {
    return <HomeView />;
  }
  // No token or signature validation on roomId parameter
  ```
- **Risk**: Insecure Direct Object Reference (IDOR) via predictable room URLs.
- **Affected Location**: `app/(guest)/[hotelSlug]/[roomId]/*`.
- **Why It Matters**: Guests can trivially switch between rooms (e.g. `/201` to `/204`) without proving physical possession or ownership of the room key/QR code.
- **Recommended Fix**: Generate cryptographically signed, short-lived tokens embedded in room QR codes (e.g. `?token=eyJhbG...`), and validate this token on the server before granting room access.

---

### 11.4. Missing Control
- **Severity**: **Medium**
- **Evidence**:
  ```javascript
  // File: components/services/FoodService.js & components/cart/ServiceCartBottomSheet.js
  // Quantities and prices are managed purely in client state
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  ```
- **Risk**: Price and quantity tampering via browser console or intercepting proxy.
- **Affected Location**: `context/AppContext.js`, `components/cart/ServiceCartBottomSheet.js`.
- **Why It Matters**: An attacker could modify `price: 0` before submitting an order. When backend APIs are added, failure to validate prices server-side will lead to financial losses.
- **Recommended Fix**: Ensure that when backend API routes are implemented, the client only transmits item IDs and quantities; the server must fetch authoritative prices from the database.

---

### 11.5. Recommendation
- **Severity**: **Informational**
- **Description**: Add strict input length limits (e.g. `maxLength={500}`) to the `specialInstructions` textarea in `ServiceCartBottomSheet.js` to prevent memory exhaustion and UI layout disruption.
