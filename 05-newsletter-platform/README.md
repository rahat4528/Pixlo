# Pixlo Newsletter Platform (Audience Broadcast Engine)

A high-performance, audience-driven newsletter publishing and broadcast engine. Built for independent creators, technical writers, and digital publications requiring strict double opt-in onboarding, RFC 8058 compliant one-click unsubscription, resilient suppression list filtering, dynamic merge tags, multi-provider email transport adapters, and engagement analytics.

---

## 1. Core Architectural Capabilities

- **Audience Management & Double Opt-in**:
  - Secure verification token generation with automated expiration.
  - Multi-status subscriber lifecycle (`PENDING_CONFIRMATION`, `CONFIRMED`, `UNSUBSCRIBED`, `CLEANED`).
  - RFC 8058 compliant `List-Unsubscribe` headers and one-click unsubscription handling.
  - Publication-scoped suppression lists preventing dispatch to bounced or unsubscribed addresses.
  - Automatic soft-bounce tracking with 3-strike escalation to permanent suppression.

- **Dynamic Template & Composition Engine**:
  - Reusable HTML and plain-text email templates.
  - Contextual merge tags: `{{subscriber.name}}`, `{{subscriber.firstName}}`, `{{subscriber.lastName}}`, `{{subscriber.email}}`, `{{publication.name}}`, `{{publication.url}}`, `{{campaign.subject}}`, `{{unsubscribe_url}}`, `{{preferences_url}}`.
  - Automatic injection of accessible unsubscribe footers when omitted in templates.
  - Dynamic link rewriting for click-tracking redirection.

- **Campaign Lifecycle & Worker Pipeline**:
  - State machine transitions: `DRAFT -> SCHEDULED -> QUEUED -> SENDING -> SENT`.
  - Partitioned batch sending with configurable rate limiting (e.g. 50 msgs/sec).
  - Pluggable delivery adapters (`MockEmailAdapter`, `SmtpEmailAdapter`, Amazon SES, Resend, SendGrid).

- **Deliverability & Engagement Tracking**:
  - 1x1 transparent tracking pixel with User-Agent and client IP hash logging.
  - Link redirect tracking with automatic open inference.
  - Aggregated analytics: Sent count, Delivered count, Unique Opens, Open Rate (%), Unique Clicks, Click-Through Rate (CTR %), and Bounce Rate (%).

---

## 2. Ports & Technology Stack

| Component | Technology | Local Port |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide React | `3005` |
| **Backend API** | NestJS, TypeScript, Passport JWT, Swagger OpenAPI | `4005` |
| **Database** | PostgreSQL 16 (`pixlo_newsletter_db`), Prisma ORM | `5435` |
| **Cache & Queue** | Redis 7 Alpine | `6385` |

---

## 3. Quick Start & Setup

### 3.1 Start Services via Docker Compose
```bash
docker compose up -d
```
This provisions dedicated PostgreSQL on port `5435` and Redis on port `6385`.

### 3.2 Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
# Configure .env from .env.example
npm run prisma:seed
npm run start:dev
```
Backend API will be live at `http://localhost:4005`. Swagger OpenAPI docs available at `http://localhost:4005/api/docs`.

### 3.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Creator Studio and Public Publication pages will be live at `http://localhost:3005`.

### 3.4 Running Test Suite
```bash
cd backend
npm test
```

---

## 4. Hosting & Deployment Status

| Sub-system | Platform | Deployment Status | Live URL |
|---|---|---|---|
| **Frontend UI** | Vercel | **Not Deployed** | - |
| **Backend API** | Render | **Not Deployed** | - |
| **Database** | PostgreSQL | **Self-Hosted / Local Docker** | `localhost:5435` |
