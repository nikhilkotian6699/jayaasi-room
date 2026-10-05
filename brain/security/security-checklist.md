# Project Security Checklist & Gap Analysis — Jayaasi Rooms

## 1. Overview
This checklist evaluates the **Jayaasi Rooms** application against industry security standards (OWASP Top 10, ASVS, CIS Benchmarks). It maps the current state of implementation across 20 security domains, providing concrete evidence, risk assessments, and targeted remediation steps.

---

## 2. Master Security Checklist Table

| # | Security Domain | Status in Current Project | Risk Level |
| :--- | :--- | :--- | :--- |
| **01** | **Authentication** | Simulated client-side only; no backend verification | **HIGH** |
| **02** | **Authorization & RBAC** | Missing; `/admin` and `/staff` are unprotected | **CRITICAL** |
| **03** | **Session / Token Security** | No cookies, JWTs, or server-side sessions exist | **HIGH** |
| **04** | **Input Validation** | Basic HTML5 attributes only; no server-side schema | **MEDIUM** |
| **05** | **Injection Prevention** | In-memory filtering safe; backend queries absent | **LOW** |
| **06** | **XSS & CSRF Prevention** | React auto-escaping present; missing anti-CSRF / CSP | **MEDIUM** |
| **07** | **API Security** | No API endpoints exist yet (`app/api` absent) | **N/A (Pre-API)** |
| **08** | **Rate Limiting & Abuse** | No rate limits on phone login, OTP, or cart orders | **HIGH** |
| **09** | **File Upload Security** | No file upload functionality implemented | **N/A** |
| **10** | **Database Security** | No database connected; mock data in JS files | **HIGH (PII Leak)** |
| **11** | **Secrets Management** | `.gitignore` ignores `.env*`; Wi-Fi pass hardcoded in JS | **HIGH** |
| **12** | **Encryption & Transport** | Relies on deployment HTTPS; no app-level crypto | **MEDIUM** |
| **13** | **CORS Configuration** | Default Next.js same-origin; no permissive headers | **LOW** |
| **14** | **Dependency Security** | 3 production dependencies; clean audit, bleeding-edge | **LOW** |
| **15** | **Logging & Monitoring** | No security event logging or error tracking service | **MEDIUM** |
| **16** | **Admin Panel Security** | Publicly accessible without password or 2FA | **CRITICAL** |
| **17** | **Deployment & Infrastructure** | Missing standard HTTP security headers in `next.config.mjs` | **HIGH** |
| **18** | **Data Privacy (PII)** | Guest names & staff emails bundled in client JS | **HIGH** |
| **19** | **Error Handling** | Unhandled exceptions could expose component stacks | **LOW** |
| **20** | **Backup & Recovery** | Mock data only; no disaster recovery plan | **N/A (Pre-DB)** |

---

## 3. Detailed Domain Evaluations & Findings

### 01. Authentication
- **Status**: **Missing Control / Simulated Only**
- **Evaluation**: `components/auth/AuthModal.js` collects a phone number, moves to a simulated "missed call" screen, and invokes `completeVerification()` on a 900ms timer. No SMS OTP is dispatched, and no credential is authenticated against a backend identity provider.
- **Finding SEC-CHK-01**:
  - **Severity**: **High**
  - **Evidence**: `components/auth/AuthModal.js:38-44` uses `setTimeout(() => completeVerification(), 900)`.
  - **Risk**: Any actor can claim to be authenticated as any guest without proving possession of the phone number or room key.
  - **Affected Location**: `components/auth/AuthModal.js`, `context/AppContext.js`.
  - **Why It Matters**: Prevents non-repudiation of orders and allows guests to bill services under false identities.
  - **Recommended Fix**: Implement real backend OTP / missed-call verification via an SMS provider (e.g. Twilio or Exotel) with signed HTTP-only session cookies.

---

### 02. Authorization & RBAC
- **Status**: **Confirmed Vulnerability**
- **Evaluation**: The application defines role tiers in `lib/constants.js` (`SUPER_ADMIN`, `HOTEL_ADMIN`, `MANAGER`, `DEPARTMENT_STAFF`) and displays them visually in `app/admin/staff/page.js`. However, there are no route handlers or Next.js middleware enforcing these roles.
- **Finding SEC-CHK-02**:
  - **Severity**: **Critical**
  - **Evidence**: `app/admin/layout.js:25-37` and `app/staff/layout.js:14-25` render privileged UI directly without inspecting user credentials or roles.
  - **Risk**: Unauthorized users can view hotel analytics, change hotel operating hours, browse room occupancy, and view the entire staff directory.
  - **Affected Location**: `app/admin/*`, `app/staff/*`.
  - **Why It Matters**: Direct violation of the Principle of Least Privilege and complete exposure of management capabilities.
  - **Recommended Fix**: Add a Next.js `middleware.js` to verify user session tokens and require role claims before permitting access to `/admin` and `/staff`.

---

### 03. Session & Token Security
- **Status**: **Missing Control**
- **Evaluation**: The application currently has no session management. Authentication state lives in a client-side React `useState` hook.
- **Finding SEC-CHK-03**:
  - **Severity**: **High**
  - **Evidence**: `context/AppContext.js:47-48`: `const [isAuthenticated, setIsAuthenticated] = useState(false);`
  - **Risk**: Authentication does not persist across browser tabs or reloads; conversely, client memory can be altered in DevTools to bypass auth gates.
  - **Affected Location**: `context/AppContext.js`.
  - **Why It Matters**: Without server-issued, cryptographically secure HTTP-only session cookies, guest authorization cannot be trusted.
  - **Recommended Fix**: Issue secure, `HttpOnly`, `SameSite=Lax`, `Secure` cookies upon successful phone verification.

---

### 04. Input Validation
- **Status**: **Security Weakness**
- **Evaluation**: Inputs use basic HTML5 constraints (`type="tel"`, `type="email"`, `maxLength={1}`). No server-side schema validation (such as Zod) is implemented.
- **Finding SEC-CHK-04**:
  - **Severity**: **Medium**
  - **Evidence**: `components/cart/ServiceCartBottomSheet.js:154-160` binds `specialInstructions` directly to a `<textarea>` without maximum length validation.
  - **Risk**: Injection of excessively long text payloads causing memory bloat or display truncation errors.
  - **Affected Location**: `components/cart/ServiceCartBottomSheet.js`, `components/cab/CabService.js`.
  - **Why It Matters**: Prevents buffer overflow and denial-of-service in future database persistence layers.
  - **Recommended Fix**: Define Zod schemas for all client-submitted payloads (cart requests, cab bookings, phone numbers) and enforce validation on backend ingestion.

---

### 05. Injection Prevention (SQL / NoSQL / Command)
- **Status**: **Protected (Current State) / Potential Risk (Future Backend)**
- **Evaluation**: There is currently no database or command execution in the app. Data filtering in `FoodService.js` and `TravelPlaces.js` uses native JavaScript array methods (`.filter()`, `.includes()`).
- **Finding SEC-CHK-05**:
  - **Severity**: **Potential Risk Requiring Verification**
  - **Evidence**: `lib/mock-data.js:4` states: *"When Prisma + PostgreSQL are added, these become database queries."*
  - **Risk**: If dynamic raw SQL queries are introduced in the future rather than parameterized queries, SQL injection vulnerabilities could arise.
  - **Affected Location**: Future database query handlers.
  - **Why It Matters**: SQL injection could lead to database exfiltration.
  - **Recommended Fix**: When adding PostgreSQL, use Prisma ORM parameterized queries exclusively. Avoid `$queryRawUnsafe`.

---

### 06. XSS & CSRF Prevention
- **Status**: **Partially Mitigated (React JSX) / Missing CSP**
- **Evaluation**: React 19 automatically escapes dynamic values inserted into JSX. No instances of `dangerouslySetInnerHTML` exist in the project. However, the site lacks a Content Security Policy (CSP).
- **Finding SEC-CHK-06**:
  - **Severity**: **Medium**
  - **Evidence**: `next.config.mjs` does not configure a `Content-Security-Policy` header.
  - **Risk**: If a third-party script or dependency is compromised, inline script execution is not restricted by browser CSP.
  - **Affected Location**: `next.config.mjs`.
  - **Why It Matters**: Defense-in-depth against stored and DOM-based Cross-Site Scripting.
  - **Recommended Fix**: Add a strict CSP header in `next.config.mjs` restricting script sources to `'self'`.

---

### 07. API Security
- **Status**: **N/A (Pre-API Stage)**
- **Evaluation**: No API endpoints exist under `app/api/` or `pages/api/`.
- **Recommendation**: When building API routes, implement standard authentication, rate limiting, and structured error responses.

---

### 08. Rate Limiting & Abuse Prevention
- **Status**: **Missing Control**
- **Evaluation**: There is no rate limiting mechanism in the client or build configuration.
- **Finding SEC-CHK-07**:
  - **Severity**: **High**
  - **Evidence**: `components/auth/AuthModal.js:28-36` allows unlimited successive submissions of phone numbers.
  - **Risk**: When connected to a real SMS gateway, attackers could spam phone numbers, causing SMS toll fraud and resource exhaustion.
  - **Affected Location**: `components/auth/AuthModal.js`, `context/AppContext.js`.
  - **Why It Matters**: SMS APIs incur direct per-message billing costs.
  - **Recommended Fix**: Implement IP-based and phone-number-based rate limiting (e.g. max 3 OTP attempts per 10 minutes via Upstash Redis or memory cache).

---

### 09. File Upload Security
- **Status**: **N/A**
- **Evaluation**: The application does not accept or process file uploads.

---

### 10. Database Security
- **Status**: **Confirmed Vulnerability (Data Inlining)**
- **Evaluation**: Because there is no database, mock records containing guest names, room occupancy status, and stay dates are stored in plain JavaScript (`lib/mock-data.js`).
- **Finding SEC-CHK-08**:
  - **Severity**: **High**
  - **Evidence**: `lib/mock-data.js:35-48` contains full guest profiles hardcoded in client-accessible assets.
  - **Risk**: Exposure of guest occupancy and stay data to unauthorized external users.
  - **Affected Location**: `lib/mock-data.js`.
  - **Why It Matters**: Violates guest privacy and data protection standards.
  - **Recommended Fix**: Transition all guest stay and occupancy data to a secure PostgreSQL database accessed only through authenticated server-side queries.

---

### 11. Secrets Management
- **Status**: **Confirmed Vulnerability**
- **Evaluation**: Plaintext Wi-Fi password is hardcoded in application source code.
- **Finding SEC-CHK-09**:
  - **Severity**: **High**
  - **Evidence**: `lib/mock-data.js:20` (`wifiPassword: 'suite204'`) and `context/AppContext.js:25`.
  - **Risk**: Hardcoded network credentials shipped directly to client web browsers.
  - **Affected Location**: `lib/mock-data.js`, `context/AppContext.js`, `RoomInformation.js`.
  - **Why It Matters**: Unauthorized access to property network infrastructure.
  - **Recommended Fix**: Remove hardcoded credentials from source code. Provide dynamic Wi-Fi access codes only to authenticated room guests.

---

### 12. Encryption & Transport Security
- **Status**: **Security Weakness**
- **Evaluation**: The app relies entirely on reverse-proxy / host TLS termination. It does not enforce HSTS (HTTP Strict Transport Security) headers.
- **Finding SEC-CHK-10**:
  - **Severity**: **Medium**
  - **Evidence**: `next.config.mjs` lacks `Strict-Transport-Security` header configuration.
  - **Risk**: Potential downgrade attacks (SSL stripping) if users navigate via plain HTTP.
  - **Affected Location**: `next.config.mjs`.
  - **Why It Matters**: Ensures browsers always communicate with the hotel application over HTTPS.
  - **Recommended Fix**: Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` to custom headers in `next.config.mjs`.

---

### 13. CORS Configuration
- **Status**: **Protected (Current State)**
- **Evaluation**: In Next.js App Router, same-origin policy is enforced by default. No wildcard `Access-Control-Allow-Origin: *` headers are set.

---

### 14. Dependency Security
- **Status**: **Protected (Current State)**
- **Evaluation**: `npm audit` shows 0 vulnerabilities. Minimal dependency footprint (`next`, `react`, `react-dom`).
- **Recommendation**: Set up Dependabot or automated dependency vulnerability scanning in CI/CD to monitor for security patches in Next.js.

---

### 15. Logging & Monitoring
- **Status**: **Missing Control**
- **Evaluation**: The application contains no centralized logging, audit trail, or error monitoring (e.g. Sentry, Datadog).
- **Finding SEC-CHK-11**:
  - **Severity**: **Medium**
  - **Evidence**: Absence of logging libraries or monitoring instrumentation in `package.json` or `layout.js`.
  - **Risk**: Inability to detect ongoing attacks, brute-force attempts, or unauthorized access to admin views.
  - **Affected Location**: Application-wide.
  - **Why It Matters**: Timely incident detection and forensics are impossible without audit logging.
  - **Recommended Fix**: Integrate structured logging for all security-relevant events (authentication attempts, order submissions, admin logins).

---

### 16. Admin Security
- **Status**: **Confirmed Vulnerability**
- **Evaluation**: The administrative portal has no multi-factor authentication (MFA) or basic authentication gate.
- **Finding SEC-CHK-12**:
  - **Severity**: **Critical**
  - **Evidence**: `app/admin/layout.js:25` renders directly upon HTTP GET.
  - **Risk**: Complete takeover of administrative functionality by any internet actor.
  - **Affected Location**: `app/admin/*`.
  - **Why It Matters**: Complete loss of administrative confidentiality and integrity.
  - **Recommended Fix**: Require hardware-backed or authenticator-app 2FA for all administrative accounts before granting access to `/admin`.

---

### 17. Deployment & Infrastructure
- **Status**: **Security Weakness**
- **Evaluation**: Missing standard HTTP defense-in-depth headers.
- **Finding SEC-CHK-13**:
  - **Severity**: **High**
  - **Evidence**: `next.config.mjs` has no `headers()` function.
  - **Risk**: Clickjacking via iframe embedding; MIME-type sniffing vulnerabilities.
  - **Affected Location**: `next.config.mjs`.
  - **Why It Matters**: Prevents UI redressing attacks and credential harvesting.
  - **Recommended Fix**: Configure standard security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

### 18. Data Privacy (PII)
- **Status**: **Confirmed Vulnerability**
- **Evaluation**: Guest names, occupancy schedules, and staff corporate emails are included in public JS bundles.
- **Finding SEC-CHK-14**:
  - **Severity**: **High**
  - **Evidence**: `lib/mock-data.js:35-48` and `lib/mock-data.js:146-152`.
  - **Risk**: Non-compliance with Digital Personal Data Protection (DPDP) Act and international privacy frameworks.
  - **Affected Location**: `lib/mock-data.js`.
  - **Why It Matters**: Exposure of real or realistic guest names linked to room numbers and stay dates violates privacy regulations.
  - **Recommended Fix**: Remove all personal data from static client mock stores.

---

### 19. Error Handling
- **Status**: **Protected (Current State)**
- **Evaluation**: Next.js production builds automatically sanitize unhandled server errors and avoid leaking database connection strings or stack traces to end users.
- **Recommendation**: Create a custom `app/error.js` component to provide user-friendly error fallbacks without debug details.

---

### 20. Backup & Disaster Recovery
- **Status**: **N/A (Pre-Database)**
- **Evaluation**: Because all state is in memory or static source files, database backup policies do not yet apply.
- **Recommendation**: When PostgreSQL is provisioned, establish automated daily snapshots with point-in-time recovery (PITR).
