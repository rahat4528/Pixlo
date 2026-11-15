# Pixlo News Aggregator

An autonomous, multi-source news syndication and story clustering platform. It aggregates RSS 2.0 and Atom 1.0 feeds from verified publishers, enforces strict SSRF protections and excerpt ceilings, clusters concurrent coverage across disparate outlets into unified story perspectives, and provides readers with a headline-dense newsroom experience and compact reader.

---

## 1. Features

- **SSRF-Protected Feed Ingestion**: Pre-fetch DNS resolution filters out private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local/cloud metadata (`169.254.169.254`), and unsafe protocols.
- **URL Canonicalization**: Strips marketing and analytics tracking parameters (`utm_*`, `fbclid`, `gclid`, `msclkid`, `mc_eid`, `ref`), sorts query parameters alphabetically, and normalizes paths.
- **Multi-tier Deduplication**: Prevents duplicate records across canonical URLs, GUIDs, and SHA-256 normalized title hashes.
- **Real-Time Story Clustering**: Detects when multiple publishers cover the same event, grouping articles into `StoryCluster` instances based on Jaccard token similarity ($\ge 0.52$).
- **Breaking News Burst Detection**: Flags stories as breaking when 3 or more independent sources publish coverage within a 4-hour window.
- **Fair Use Excerpt Ceiling**: Strictly limits story excerpts to 350 characters. Strips all HTML markup and scripts. Full articles are never scraped or stored; readers are routed to the original publication via prominent action links.
- **Personalized Reader Feed**: Weighted ranking based on followed publishers (+40), preferred category subscriptions (+25), breaking status (+30), and 48-hour half-life time decay.
- **Admin Ingestion Console**: Source reliability meters, failure tracking, exponential backoff scheduling, automatic circuit-breaker suspension after 5 consecutive failures, and manual retry/resume controls.

---

## 2. Architecture & Technology Stack

| Component | Technology | Port |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons | `3003` |
| **Backend API** | NestJS, TypeScript, Passport JWT, Swagger / OpenAPI | `4003` |
| **Database** | PostgreSQL (`pixlo_news_db`), Prisma ORM | `5433` |
| **Cache & Queue** | Redis | `6383` |
| **Syndication Engine** | `fast-xml-parser`, custom SSRF Guard, Ingestion Worker | Embedded / CLI |

---

## 3. Directory Structure

```
03-news-aggregator/
  .env.example                 # Configuration template
  docker-compose.yml           # PostgreSQL (5433) & Redis (6383)
  README.md                    # Project documentation
  database/
    schema.prisma              # Data models and relations
    seeds/
      seed.ts                  # Seed script with realistic publishers & stories
  ingestion/                   # Core syndication primitives
    ssrf-guard.ts              # Network boundary and IP validator
    feed-parser.ts             # RSS 2.0 & Atom 1.0 parser
    canonicalizer.ts           # URL normalizer & tracking stripper
    deduplicator.ts            # Hashing and Jaccard similarity matcher
    excerpt-sanitizer.ts       # HTML stripper & length enforcer
  workers/                     # Background tasks
    ingestion-worker.ts        # Feed fetcher, conditional ETag & circuit breaker
    clustering-worker.ts       # Story grouping & burst detector
  backend/                     # NestJS API application
    src/
      modules/
        auth/                  # Identity & JWT authentication
        sources/               # Publisher records & category taxonomy
        articles/              # Headline querying, search & bookmarks
        clusters/              # Multi-source story clusters
        personalization/       # Preference tuning & scoring feed
        ingestion/             # Admin console, jobs & retry logic
  frontend/                    # Next.js editorial newsroom
    src/
      app/
        page.tsx               # Newsroom front page & breaking ticker
        category/[slug]/       # Category desks (Technology, Business, etc.)
        source/[slug]/         # Publisher profile & feed view
        cluster/[id]/          # Side-by-side publisher coverage
        reader/[id]/           # Compact reader view & publisher attribution
        feed/                  # Personalized algorithmic feed
        saved/                 # Reading list & bookmarks
        admin/ingestion/       # Ingestion console & source controls
  tests/                       # End-to-end integration test suites
  docs/                        # Engineering documentation
    requirements.md            # Functional & non-functional requirements
    architecture.md            # System topology & ingestion pipeline
    api.md                     # REST API reference
    completion-report.md       # Phase verification sign-off
```

---

## 4. Operational & Fair Use Notice

> [!IMPORTANT]
> **Operator Compliance**: The operator of this news aggregator must verify and confirm each configured publisher source's terms of use and robots.txt directives prior to activating automated feed polling.
>
> **Syndication Integrity**: Pixlo stores permitted metadata, headlines, attribution, links, and short excerpts only (capped at 350 characters). It never scrapes full article bodies or bypasses publisher paywalls. All article cards and reader views provide direct attribution and links to the original publisher.
>
> **AI Summaries**: Any AI-generated digests must be explicitly labeled as generated and provide a direct link to the original article source.

---

## 5. Local Setup & Execution

### 5.1 Start Infrastructure Containers
```bash
docker compose up -d
```
Starts PostgreSQL on port `5433` and Redis on port `6383`.

### 5.2 Configure and Seed Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:seed
npm run start:dev
```
Backend API will be accessible on `http://localhost:4003`.  
Swagger OpenAPI explorer: `http://localhost:4003/api/docs`.

### 5.3 Start Newsroom Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Newsroom frontend will be accessible on `http://localhost:3003`.

---

## 6. Running Tests

```bash
cd backend
npm test
```
Executes all unit, integration, SSRF defense, deduplication, and story clustering test suites.

---

## 7. Database Backup & Restore

### Backup
```bash
docker exec -t pixlo_news_postgres pg_dump -U postgres pixlo_news_db > pixlo_news_db_backup.sql
```

### Restore
```bash
docker exec -i pixlo_news_postgres psql -U postgres -d pixlo_news_db < pixlo_news_db_backup.sql
```
