# Target Production Technology Stack Architecture — Jayaasi Rooms

This document records the official target production architecture, technology stack, and operational standards for the Jayaasi Rooms platform across both the Guest Web Experience and the Hotel Operations & Admin Portal.

| Layer | Choice | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js App Router** | Guest web + Admin web with isolated layouts |
| **Primary Language** | **TypeScript** | Frontend, backend/API, shared types |
| **Styling** | **Vanilla CSS + CSS Variables** | Precise luxury UI, responsive design, animations |
| **UI Components** | **Custom React Components** | Reusable service cards, modals, bottom sheets, tables, forms |
| **Guest UI** | **Next.js + React** | Mobile-first hotel guest experience |
| **Admin UI** | **Next.js + React** | Desktop/tablet hotel management interface |
| **Routing** | **Next.js App Router** | Guest/admin route separation |
| **Backend** | **Next.js Route Handlers / Server Actions** | API and server-side business logic |
| **Backend Language** | **TypeScript** | Same language across frontend/backend |
| **Database** | **PostgreSQL** | Users, hotels, rooms, services, orders, carts, staff, etc. |
| **ORM** | **Prisma** | Type-safe database access and migrations |
| **Authentication** | **Auth.js / custom OTP authentication** | Guest + staff authentication |
| **Phone Verification** | **SMS/OTP provider** | Guest phone verification |
| **Session Management** | **Secure HTTP-only cookies** | Maintain authenticated sessions |
| **Caching** | **Redis** | Sessions, temporary cart data, rate limits, caching |
| **File Storage** | **Amazon S3 / Cloudflare R2** | Hotel images, room images, product images, documents |
| **Image Optimization** | **Next.js Image** | Responsive and optimized images |
| **API Communication** | **REST API** | Frontend ↔ backend communication |
| **Validation** | **Zod** | Validate forms, API requests and database inputs |
| **Forms** | **React Hook Form + Zod** | Guest/admin forms |
| **State Management** | **Zustand** | Cart, modal, guest UI state and temporary client state |
| **Server State** | **TanStack Query** | API data fetching, caching and synchronization |
| **Payments** | **Razorpay / Stripe** | Online payments if required |
| **Email** | **Resend / Amazon SES** | Transactional emails |
| **SMS** | **MSG91 / Twilio / similar** | OTP and guest notifications |
| **QR Code** | **QR generation library** | Room-specific guest access |
| **Real-time Updates** | **WebSocket / Socket.IO** | Staff receives new service requests instantly |
| **Background Jobs** | **BullMQ + Redis** | Notifications, processing, scheduled jobs |
| **Search** | **PostgreSQL full-text search** initially | Search hotel services/products |
| **Logging** | **Pino** | Backend/application logs |
| **Error Monitoring** | **Sentry** | Production error tracking |
| **Testing** | **Vitest + Playwright** | Unit + end-to-end testing |
| **API Documentation** | **OpenAPI / Swagger** | Document APIs |
| **Code Quality** | **ESLint + Prettier** | Consistent, maintainable code |
| **Package Manager** | **pnpm** | Fast dependency management |
| **Version Control** | **Git + GitHub** | Collaboration and source control |
| **CI/CD** | **GitHub Actions** | Automated testing/build/deployment |
| **Frontend Hosting** | **Vercel** | Next.js deployment |
| **Database Hosting** | **Supabase / Neon / AWS RDS** | Managed PostgreSQL |
| **Redis Hosting** | **Upstash Redis** | Managed Redis |
| **Object Storage** | **Cloudflare R2 / Amazon S3** | File/image storage |
| **CDN** | **Cloudflare** | CDN, DNS, security and caching |
| **Environment Management** | **`.env` variables + deployment secrets** | API keys and credentials |
| **Security** | **HTTPS + CSP + CSRF protection + rate limiting** | Production security |

---

### Core Guidelines Derived From This Stack
1. **Zero Style Drift**: Maintain Vanilla CSS with CSS Variables for ultra-fast luxury UI without Tailwind bloat.
2. **Type Safety & Validation**: All new forms and backend routes must leverage TypeScript and Zod schemas.
3. **Session & Security Integrity**: Always use secure HTTP-only cookies, strict CORS/CSRF headers, and rate limiting on sensitive routes (OTP, billing, admin actions).
4. **State Separation**:
   - UI / Temporary client state → **Zustand**
   - Server state / Remote synchronizations → **TanStack Query**
   - Real-time staff dispatching → **WebSocket / Socket.IO**
