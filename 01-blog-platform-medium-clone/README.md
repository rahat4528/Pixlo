# Blog Platform (Medium Clone) — Pixlo

A production-quality editorial article publishing platform and author-reader ecosystem built with Next.js, NestJS, TypeScript, PostgreSQL, and Redis.

---

## 1. Overview & Purpose
The Blog Platform provides a distraction-free, typography-focused editorial environment for authors, publications, and readers. It delivers a complete content lifecycle: structured draft composition, deterministic reading time calculation, immutable revision histories, multi-author editorial review pipelines, personalized feed generation, reader engagement (applause, threaded comments, bookmarks), session-deduplicated analytics, and server-side paywall gating.

---

## 2. Feature Matrix

- **Identity & Profiles**:
  - Secure authentication with bcrypt password hashing and JWT access/refresh token rotation.
  - Public author profiles (`/@username`) with biography, avatar, follower counts, and published stories.
  - Social follow graph: follow and unfollow creators.
- **Editorial Composition & Workflows**:
  - Distraction-free rich content editor with headings, code blocks, blockquotes, and cover images.
  - Deterministic reading time estimation: 200 words-per-minute with image (+12s) and code block (+10s) adjustments.
  - Automatic debounced autosave and immutable version history (`ArticleRevision`). Authors can inspect past revisions and restore previous drafts.
  - Explicit state machine: `DRAFT -> SUBMITTED -> IN_REVIEW -> (CHANGES_REQUESTED | APPROVED) -> SCHEDULED -> PUBLISHED -> UNPUBLISHED`.
  - Strict draft privacy: unpublished articles are restricted to authors and publication editors.
- **Publications & Multi-Author Editorial Boards**:
  - Multi-author publications with hierarchical roles: `OWNER`, `EDITOR`, and `WRITER`.
  - Editorial review queues: writers submit drafts; editors review, request changes with notes, or approve for publication.
- **Reading & Discovery**:
  - Server-rendered editorial reading pages with generous typography and narrow reading columns (max-width: 680px).
  - Personalized feed ranking scored by author follows (+40), tag affinity from reading history (+25), publication (+20), and 7-day exponential recency decay.
  - Discovery filtering by categories, tags, trending, and full-text keyword search.
- **Community Engagement**:
  - Multi-reaction system: Applause (1–50 claps with per-user limit), Insightful, and Heart.
  - Threaded hierarchical discussions with HTML sanitization allowlists and editorial moderation controls.
  - Bookmarks and custom Reading Lists (public or private).
  - Reading history tracking with scroll depth and duration telemetry.
- **Author Analytics**:
  - Session-deduplicated view counters and scroll-depth completion tracking.
  - Author Studio dashboard: aggregate views, unique readers, aggregate reading minutes, applause count, and average completion rate.
- **Server-Side Paywall & Memberships**:
  - Authors and publications can designate stories as member-exclusive (`isMembersOnly: true`).
  - Server strictly excludes full article content and serves only a 2-paragraph teaser to non-members.
- **Syndication & SEO**:
  - Open Graph meta tags, Schema.org `Article` JSON-LD structured data.
  - Dynamic `sitemap.xml` for published stories and authors.
  - RSS 2.0 feeds per author (`/api/v1/syndication/rss/author/:username`) and per publication (`/api/v1/syndication/rss/publication/:slug`).

---

## 3. Architecture & Tech Stack

```
01-blog-platform-medium-clone/
  ├── frontend/              # Next.js 14 App Router, Tailwind CSS, Lucide Icons
  ├── backend/               # NestJS 10, TypeScript, Prisma ORM, JWT, class-validator
  ├── database/              # PostgreSQL schema, migrations, and seed scripts
  ├── tests/                 # Unit, security, and end-to-end integration test suites
  ├── docs/                  # Requirements, API specs, architecture, completion report
  ├── docker-compose.yml     # PostgreSQL (5431), Redis (6381), MinIO (9001/9002)
  ├── .env.example
  └── README.md
```

### Technology Rationale
- **Next.js & React**: Provides Server-Side Rendering (SSR) for public articles and author profiles, maximizing SEO indexing and initial content paint speeds.
- **NestJS & TypeScript**: Enforces modular architecture (Auth, Authors, Articles, Publications, Feeds, Engagement, Analytics, Syndication) with dependency injection and OpenAPI contract validation.
- **PostgreSQL & Prisma**: Delivers relational integrity, foreign key cascades, and type-safe data access for complex editorial models.
- **Redis & BullMQ**: Handles feed caching, rate limits, and asynchronous scheduled publishing workers.
- **sanitize-html**: Strips unauthorized HTML tags, script injection vectors, and javascript: links before database persistence.

---

## 4. Database Structure (`pixlo_blog_db`)

- `User`: Identity, password hash, and system role (`READER`, `AUTHOR`, `ADMIN`).
- `AuthorProfile`: User biography, username, avatar, and social links.
- `Publication`: Publication details, review policies, and branding.
- `PublicationMember`: Publication membership with roles (`OWNER`, `EDITOR`, `WRITER`).
- `Article`: Core story record with slug, status, reading time, paywall flag, and metrics.
- `ArticleRevision`: Immutable snapshot of title, content, and revision notes on every save.
- `EditorialReview`: Submission reviews with verdicts (`APPROVED`, `CHANGES_REQUESTED`) and feedback notes.
- `Category` & `Tag`: Classification taxonomies.
- `Follow`: Social follow graph between readers and creators.
- `Reaction`: Deduplicated applause and sentiment reactions.
- `Comment`: Threaded parent-child discussions with moderation flags.
- `Bookmark` & `ReadingList`: Saved story collections.
- `ReadingHistory`: Per-user reading progress and scroll depth.
- `ArticleAnalytics`: Session-deduplicated view events and time spent.
- `Membership`: Active subscription grants for member-only access.

---

## 5. Local Setup & Installation

### Step 1: Start Backing Services
```bash
docker compose up -d
```
Starts PostgreSQL on port `5431`, Redis on `6381`, and MinIO on `9001/9002`.

### Step 2: Configure Environment
```bash
cp .env.example .env
```

### Step 3: Setup Backend & Database
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```
Backend API will listen on `http://localhost:4001/api/v1`.
OpenAPI documentation is available at `http://localhost:4001/api/docs`.

### Step 4: Setup & Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend web application will run at `http://localhost:3001`.

---

## 6. Seed Demo Accounts

| Account Role | Email | Password | Details |
|---|---|---|---|
| **Platform Admin** | `admin@pixlo.local` | `Admin123!` | System administrator |
| **Author (Elena)** | `elena.rostova@pixlo.local` | `Author123!` | Principal Distributed Systems Architect (`@elena_writes`) |
| **Author (Marcus)** | `marcus.chen@pixlo.local` | `Author123!` | Staff Frontend Engineer (`@marcus_codes`) |
| **Reader (Sarah)** | `sarah.jenkins@pixlo.local` | `Reader123!` | Reader with active paid membership |
| **Reader (David)** | `david.kim@pixlo.local` | `Reader123!` | Standard reader account |

---

## 7. Testing & Verification

Execute all unit, integration, state machine, and security tests:
```bash
cd backend
npm test
```

Execute security-specific suites (XSS sanitization, draft privacy, paywall gating):
```bash
npm run test:security
```

---

## 8. Deployment & Operational Notes

- For production deployment, build both services:
  - Backend: `cd backend && npm run build && npm run start:prod`
  - Frontend: `cd frontend && npm run build && npm run start`
- S3 / MinIO storage adapter can be swapped via `STORAGE_DRIVER=s3` in `.env`.
- Database backups can be scheduled using standard PostgreSQL `pg_dump`:
  ```bash
  pg_dump -U pixlo_user -d pixlo_blog_db -h localhost -p 5431 > backup_blog_$(date +%F).sql
  ```
