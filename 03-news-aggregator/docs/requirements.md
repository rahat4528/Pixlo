# Pixlo News Aggregator — Requirements Specification

## 1. Executive Summary

Pixlo News Aggregator (`03-news-aggregator`) is a high-performance content syndication and curation platform. It automates RSS and Atom feed fetching across verified publishers, clusters related stories covering the same events into unified multi-source perspectives, indexes permitted metadata and concise excerpts, and provides readers with a searchable newsroom interface that strictly preserves attribution and links back to original journalism.

## 2. Functional Requirements

### 2.1 Publisher and Source Management
- **FR-1.1 Source Registration**: Administrators can register publishers with display name, slug, official website URL, logo asset URL, taxonomy category, and active status.
- **FR-1.2 Feed Configuration**: Sources support RSS 2.0 and Atom 1.0 feed URLs, custom refresh intervals (5 to 1440 minutes), and format auto-detection.
- **FR-1.3 Operational Status**: Sources transition through lifecycle states: `ACTIVE`, `PAUSED`, `ERROR`, and `SUSPENDED`.
- **FR-1.4 Publisher Metrics**: System tracks total syndicated stories, consecutive crawl failures, last crawl timestamp, and follower counts.

### 2.2 Feed Ingestion Engine & SSRF Protection
- **FR-2.1 SSRF Validation**: Every feed URL is validated prior to DNS resolution and HTTP dispatch. Private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local/cloud metadata (`169.254.0.0/16`), and non-HTTP protocols (`file:`, `ftp:`) are strictly blocked.
- **FR-2.2 Conditional HTTP Requests**: Feed requests leverage HTTP `If-None-Match` (ETag) and `If-Modified-Since` headers to prevent redundant downloads when feeds have not changed (`304 Not Modified`).
- **FR-2.3 Network Guardrails**: Strict timeouts (8000ms) and payload size limiters (2MB max) prevent slow-loris or XML entity expansion denial-of-service attacks.
- **FR-2.4 Idempotent Ingestion**: Repeated ingest cycles do not produce duplicate records or duplicate source mappings.

### 2.3 URL Canonicalization & Multi-tier Deduplication
- **FR-3.1 Tracking Parameter Stripping**: Strips marketing and analytics query strings (`utm_*`, `fbclid`, `gclid`, `msclkid`, `mc_eid`, `ref`) while preserving functional queries sorted alphabetically.
- **FR-3.2 Normalized Title Hashing**: Computes SHA-256 hashes of lowercased, punctuation-stripped, and whitespace-collapsed titles.
- **FR-3.3 Multi-tier Deduplication**: Evaluates canonical URL matches, GUID matches, normalized title hashes, and Jaccard token similarity thresholds.

### 2.4 Story Clustering & Breaking News Alerts
- **FR-4.1 Semantic Story Clustering**: Automatically groups concurrent articles from disparate publishers covering the identical real-world event into `StoryCluster` instances based on Jaccard token similarity ($\ge 0.52$).
- **FR-4.2 Representative Article Election**: Designates the earliest published or highest-authority article in a cluster as the primary anchor.
- **FR-4.3 Breaking News Burst Detection**: Detects breaking events when $\ge 3$ distinct publishers syndicate stories within a 4-hour sliding window, tagging the cluster with `isBreaking: true`.

### 2.5 Excerpt Enforcement & Fair Use Attribution
- **FR-5.1 Strict Excerpt Limits**: Enforces a strict ceiling of 350 characters on story excerpts. All HTML tags, inline scripts, and styling elements are stripped before storage.
- **FR-5.2 Publisher Redirection**: Pixlo never scrapes or reproduces full article bodies. The UI prominently displays direct links and call-to-action buttons ("Read Full Coverage on [Publisher]") guiding users to the original publication.

### 2.6 Discovery & Personalization
- **FR-6.1 Category Taxonomies**: Standard channels: Technology, Business, Science, World, Local, Sports.
- **FR-6.2 Personalized Scoring Algorithm**: Weighted scoring based on followed publishers (+40), preferred categories (+25), breaking status (+30), and time decay (48-hour half-life).
- **FR-6.3 Reading Engagement**: Saved articles (bookmarks with personal notes) and reading duration history tracking.

### 2.7 Ingestion Console, Exponential Backoff & Circuit Breaker
- **FR-7.1 Error Logging**: Failed ingestion jobs capture error codes (`HTTP_503`, `TIMEOUT`, `SSRF_REJECTED`), error details, and retry attempt counters.
- **FR-7.2 Exponential Backoff**: Calculates retry intervals using $2 \times 2^{\text{retries}}$ minutes plus randomized jitter.
- **FR-7.3 Automatic Suspension**: When a publisher source accumulates 5 consecutive crawl failures, the system automatically transitions its status to `SUSPENDED` to prevent wasted system bandwidth.
- **FR-7.4 Operator Recovery**: Admin console provides immediate manual retry buttons and source resumption triggers.

## 3. Non-Functional Requirements
- **Independence**: Operates completely stand-alone with its own database (`pixlo_news_db` on port 5433) and cache (port 6383).
- **Security**: Argon2/bcrypt authentication, role-based authorization (`ADMIN`, `READER`), parameterized queries, input validation pipes.
- **Performance**: Sub-100ms response time for indexed article queries and cluster lookups.
