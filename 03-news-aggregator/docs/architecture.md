# Pixlo News Aggregator — System Architecture

## 1. High-Level Architecture Overview

The Pixlo News Aggregator is organized into three decoupled layers:
1. **Frontend Presentation Layer**: Next.js 14 App Router application delivering a headline-dense, newsroom-style editorial interface and compact reader.
2. **Backend Services & API Layer**: NestJS modular service hosting the REST API, JWT authentication, and administrative controls.
3. **Ingestion & Clustering Workers**: Independent worker modules enforcing network isolation, SSRF prevention, fast XML stream parsing, URL canonicalization, and real-time story clustering.

```
+-----------------------------------------------------------------------+
|                          Next.js 14 Frontend                          |
|  - Newsroom Front Page       - Multi-Source Cluster Views             |
|  - Category Desks            - Compact Reader (Attribution Focused)   |
|  - Personalized Feed Desk    - Admin Ingestion Console                |
+------------------------------------+----------------------------------+
                                     | (REST API / JSON)
                                     v
+-----------------------------------------------------------------------+
|                          NestJS API Backend                           |
|  - AuthModule (JWT & RBAC)           - SourcesModule                  |
|  - ArticlesModule (Pagination/Search)- ClustersModule (Reclustering)  |
|  - PersonalizationModule (Scoring)   - IngestionModule (Jobs/Errors)  |
+-------------------+--------------------------------+------------------+
                    |                                |
                    v                                v
+------------------------------------+   +------------------------------+
|      Ingestion Worker Pipeline     |   |   PostgreSQL (pixlo_news_db) |
|  - SSRF Guard (Private IP Filter)  |   |   - users                    |
|  - Feed Parser (RSS 2.0 / Atom)    |   |   - news_sources             |
|  - Canonicalizer (Strip Tracking)  |   |   - feed_sources             |
|  - Deduplicator (Title Hash/Jaccard|   |   - news_articles            |
|  - Excerpt Sanitizer (350 Chars)   |   |   - story_clusters           |
|  - Circuit Breaker (5 Failure Cap) |   |   - ingestion_jobs & errors  |
+------------------------------------+   +------------------------------+
```

## 2. Ingestion Pipeline & Reliability Cycle

```
[ Scheduled Trigger / Admin Ingest ]
                 |
                 v
     [ 1. SSRF Guard Validation ] ---> Invalid IP / Protocol ---> [ Terminate Job ]
                 | Safe
                 v
 [ 2. HTTP Conditional Fetch (ETag) ] ---> 304 Not Modified ---> [ Mark Complete (0 new) ]
                 |
                 | HTTP 200 (Enforce 8s Timeout & 2MB Limit)
                 v
     [ 3. Stream XML Parsing ] ---> Syntax Error ---> [ Log IngestionError & Backoff ]
                 |
                 v
   [ 4. Canonicalization & Sanitization ]
   - Strip UTM / Tracking Parameters
   - Lowercase Domains & Paths
   - Strip HTML Tags & Truncate Excerpt (<= 350 chars)
                 |
                 v
    [ 5. Deduplication Gate ]
    - Exact Canonical URL match?
    - Exact GUID match?
    - Normalized Title SHA-256 match?
                 |
     +-----------+-----------+
     | New                   | Duplicate
     v                       v
[ Insert NewsArticle ]   [ Map Source to Existing ]
                 |
                 v
[ 6. Story Clustering Worker ]
- Jaccard Token Overlap >= 0.52
- Form or join StoryCluster
- Burst Detection (>= 3 sources in 4h -> isBreaking)
                 |
                 v
[ 7. Update Source Health & Reset Consecutive Failures ]
```

## 3. Database Schema Design

### 3.1 Primary Entities
- `NewsSource`: Publisher record holding name, slug, status (`ACTIVE`, `SUSPENDED`, `ERROR`, `PAUSED`), failure counters, and category.
- `FeedSource`: Endpoint configuration for RSS/Atom syndication, tracking last ETag and Last-Modified headers.
- `StoryCluster`: Semantic grouping linking multiple articles covering the same real-world event.
- `NewsArticle`: Indexed story record with canonical URL, original publisher link, enforced excerpt, and author attribution.
- `ArticleSourceMapping`: Multi-source association capturing which feed discovered which article.
- `IngestionJob`: Granular audit log of each crawl pass recording items found, items ingested, and duplicates skipped.
- `IngestionError`: Active error tracking for failed crawl attempts with retry counters and exponential backoff timestamps.
- `UserPreference`: Personalized reader profile storing category weights and breaking news notification toggles.

## 4. Security & Compliance Measures

1. **SSRF Prevention**: Strict pre-fetch validation against loopback, private RFC 1918 subnets, and cloud instance metadata addresses (`169.254.169.254`).
2. **Denial-of-Service Defense**: Ingestion requests have a hard 8000ms timeout and reject payloads exceeding 2MB.
3. **Data Protection**: Excerpts are sanitized of all executable HTML scripts and style sheets.
4. **Fair Use & Copyright Architecture**: Full articles are never stored or displayed. Readers are routed directly to original journalism via canonical publisher links.
