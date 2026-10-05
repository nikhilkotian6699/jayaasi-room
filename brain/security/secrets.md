# Secrets Management & Exposure Assessment — Jayaasi Rooms

## 1. Scope & Objective
This document details the audit of sensitive data, credentials, configuration secrets, and exposure vectors across the **Jayaasi Rooms** codebase. It evaluates where secrets are expected, how configuration is managed, client-side exposure risks, Git history hygiene, and secret rotation procedures.

---

## 2. Where Secrets Are Expected

As this application transitions from a frontend prototype to a production hospitality platform, the following secrets and sensitive parameters will be required:

| Secret Type | Purpose | Intended Storage / Environment | Risk if Exposed |
| :--- | :--- | :--- | :--- |
| **Database Connection String** | PostgreSQL / Prisma access string with credentials | Server environment (`DATABASE_URL`) | Complete database compromise, data exfiltration, deletion |
| **Session / JWT Signing Key** | Cryptographically signing guest and staff authentication tokens | Server environment (`AUTH_SECRET` / `JWT_SECRET`) | Token forgery, arbitrary account takeover, privilege escalation |
| **SMS / Missed-Call Gateway API Key** | Twilio, Exotel, or Gupshup credentials for OTP verification | Server environment (`SMS_GATEWAY_API_KEY`) | SMS toll fraud, account takeover via intercepted OTPs |
| **Payment Gateway API Secret** | Razorpay or Stripe secret keys for guest bill settlements | Server environment (`RAZORPAY_KEY_SECRET`) | Unauthorized refunds, fraudulent transactions, revenue theft |
| **WhatsApp Business API Key** | Automated order/request updates to guests on WhatsApp | Server environment (`WHATSAPP_API_TOKEN`) | Guest spamming, message tampering, API quota exhaustion |
| **Property Wi-Fi Passphrase** | Pre-shared key for the guest Wi-Fi network (`Jayaasi_Guest`) | Hotel property network configuration | Local network interception, rogue AP attacks, guest traffic sniffing |

---

## 3. Environment & Configuration Handling

### 3.1. Current Configuration Analysis
- **`.gitignore` Analysis**:
  - The repository's [`.gitignore`](file:///Users/nikhilkotian/Desktop/Jayaasi%20/jayaasi-room/.gitignore#L33-L35) includes line 34: `.env*`.
  - This successfully prevents accidental commits of local `.env`, `.env.local`, `.env.production`, or `.env.development` files.
- **Environment Template (`.env.example`)**:
  - **Status**: **Missing**.
  - There is currently no `.env.example` or documentation specifying which environment variables are required when deploying the application.
- **Next.js Prefix Rules**:
  - In Next.js, variables prefixed with `NEXT_PUBLIC_` are inlined into client JavaScript bundles at build time. Variables without this prefix remain server-only.
  - Currently, no environment variables are defined or accessed via `process.env` in the codebase.

---

## 4. Git & Commit History Audit

An inspection of the repository Git history was performed across all commits:
- Commit `90134109c057066864eba3450de8eb86070f5afb` (*Initial commit*)
- Commit `a0b60e182b92ebd95c89606974f810c16d55a3ca` (*2nd*)

### Audit Findings:
1. **Third-Party API Keys**: No live cloud provider keys (AWS, GCP, Twilio, Stripe, Razorpay) were detected in git history.
2. **Private Cryptographic Keys**: No `.pem`, `.key`, or RSA private keys were found.
3. **Committed Mock Credentials**: Static property credentials and mock PII were committed in `lib/mock-data.js` upon repository initialization.

---

## 5. Client-Side Exposure Analysis

In Next.js, any file imported by a file marked with `'use client'` is bundled into the client bundle and delivered to the user's browser.

### 5.1. The `lib/mock-data.js` Exposure Vector
- `lib/mock-data.js` is imported by:
  - `components/layout/MobileHeader.js`
  - `app/admin/settings/page.js`
  - `app/admin/staff/page.js`
  - `components/guest/GuestHeader.js`
- **Result**:
  1. The entire dataset—including all 12 guest room assignments, occupancy statuses, check-in/out times, staff corporate emails (`@jayaasi.in`), and the Wi-Fi password—is bundled into public JavaScript chunks.
  2. Anyone visiting the public guest home page (`/`) downloads the entire hotel roster and property secrets in the browser network tab.

---

## 6. Logging & Error Exposure Risks

- **Browser Console**:
  - While production builds strip standard React debug traces, runtime errors could reveal state objects in console logs if unhandled.
- **UI Toast Alerts**:
  - `showToast()` in `context/AppContext.js` and various components echoes user inputs directly into DOM toast notifications. For example:
    - `showToast(`Added "${name}" to request`)`
    - `showToast(`Verifying via secure missed call to ${pendingPhone}`)`
  - If sensitive tokens or credentials were ever passed through toast messages, they would be visible on screen and recorded in browser session replays.

---

## 7. Secret Rotation Requirements

When persistent backend and third-party integrations are connected, the following rotation schedules and procedures must be established:

1. **Guest Wi-Fi Passphrase**:
   - *Frequency*: Monthly or upon guest check-out cycle.
   - *Procedure*: Integrate with hotel RADIUS / captive portal server rather than relying on a static shared WPA2 key.
2. **Session Signing Key (`AUTH_SECRET`)**:
   - *Frequency*: Every 90 days or immediately upon suspected compromise.
   - *Procedure*: Implement key rotation with dual-key verification (allow previous key for validation during active session grace periods, sign with new key).
3. **Payment & SMS Gateway Keys**:
   - *Frequency*: Annually or upon developer offboarding.
   - *Procedure*: Zero-downtime rotation using secondary API keys provided by Stripe/Razorpay/Twilio dashboards.

---

## 8. Specific Findings & Audit Evidence

### 8.1. Confirmed Vulnerability
- **Severity**: **High**
- **Evidence**:
  ```javascript
  // File: lib/mock-data.js (lines 19-20)
  wifiName: 'Jayaasi_Guest',
  wifiPassword: 'suite204',

  // File: context/AppContext.js (lines 24-25)
  wifiNetwork: 'Jayaasi_Guest',
  wifiPassword: 'suite204',
  ```
- **Risk**: Hardcoded Wi-Fi passphrase shipped directly to every external client browser.
- **Affected Location**: `lib/mock-data.js`, `context/AppContext.js`, `components/room/RoomInformation.js`.
- **Why It Matters**: Anyone on the internet or within wireless range of the hotel can inspect the site bundle, retrieve the network passphrase, and gain unauthorized access to the property's local wireless network.
- **Recommended Fix**: Remove the static network password from public client state. For in-room Wi-Fi, integrate a dynamic captive portal or display credentials only after verified room check-in via a server-authenticated session.

---

### 8.2. Security Weakness
- **Severity**: **Medium**
- **Evidence**:
  ```javascript
  // File: lib/mock-data.js (lines 147-151)
  export const staff = [
    { id: 'usr_001', name: 'Arjun Kumar', role: 'Hotel Admin', email: 'arjun@jayaasi.in', active: true },
    { id: 'usr_002', name: 'Sneha Patil', role: 'Manager', email: 'sneha@jayaasi.in', active: true },
    { id: 'usr_003', name: 'Rohan Verma', role: 'Department Staff', email: 'rohan@jayaasi.in', active: true },
    { id: 'usr_004', name: 'Neha Desai', role: 'Department Staff', email: 'neha@jayaasi.in', active: true },
    { id: 'usr_005', name: 'Mohit Kulkarni', role: 'Department Staff', email: 'mohit@jayaasi.in', active: true },
  ];
  ```
- **Risk**: Internal corporate email addresses and employee role mappings are embedded in client bundles.
- **Affected Location**: `lib/mock-data.js:146-152`, imported into client views.
- **Why It Matters**: Enables automated harvesting of corporate staff emails for targeted phishing, credential stuffing, and social engineering against hotel personnel.
- **Recommended Fix**: Restrict staff directory data strictly to authenticated server-side API responses with role-based access checks. Do not export internal staff emails into shared client mock modules.

---

### 8.3. Missing Control
- **Severity**: **Medium**
- **Evidence**: Absence of `.env.example` in repository root.
- **Risk**: Developers or operators may configure secrets haphazardly without standardized names, or commit credentials in unprotected config files.
- **Affected Location**: Repository root.
- **Why It Matters**: Lack of standardized environment templates leads to configuration drift, missed secrets during deployment, and potential leakage if developers create ad-hoc variable names.
- **Recommended Fix**: Provide a documented `.env.example` file specifying placeholders for future production keys (e.g. `DATABASE_URL=`, `AUTH_SECRET=`, `NEXT_PUBLIC_APP_URL=`).

---

### 8.4. Potential Risk Requiring Verification
- **Severity**: **Low**
- **Evidence**:
  ```javascript
  // File: lib/mock-data.js (lines 167-168)
  export const cabProviders = [
    { id: 'cab_uber', name: 'Uber', logo: 'U', color: '#000', enabled: true, description: 'Ride link · hotel pickup prefilled' },
    { id: 'cab_ola', name: 'Ola', logo: 'O', color: '#559231', enabled: true, description: 'Affiliate link · pickup and drop prefilled' },
  ];
  ```
- **Risk**: Potential leakage of affiliate tracking tokens or third-party secret tokens if real API links are introduced without server-side proxying.
- **Affected Location**: `lib/mock-data.js`, `app/cab/page.js`.
- **Why It Matters**: Exposing third-party affiliate secret tokens in client code allows third parties to abuse quotas or hijack affiliate attribution.
- **Recommended Fix**: Ensure that when live Uber/Ola deep-linking or ride request APIs are implemented, affiliate credentials and webhook signing keys are maintained on the backend server.

---

### 8.5. Recommendation
- **Severity**: **Informational**
- **Description**: Adopt secret scanning in CI/CD (e.g., GitGuardian, Gitleaks, or GitHub Secret Scanning) prior to connecting live backend databases and payment processors to prevent accidental credential commits.
