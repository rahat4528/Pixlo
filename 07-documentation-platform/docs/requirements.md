# Documentation Platform — Requirements Specification

## 1. Overview
The Documentation Platform (`07-documentation-platform`) is an enterprise-grade developer documentation and API reference engine. It features a custom static site generator (SSG) in Python, multi-version semantic document routing, YAML frontmatter processing, custom callout admonitions (`:::note`, `:::tip`, `:::warning`, `:::danger`), OpenAPI 3.x specification parsing with runnable cURL snippets, compile-time dead link and anchor auditing, and full-text inverted search indexing.

## 2. Functional Requirements

### 2.1 Multi-Version Documentation Management
- **Semantic Versioning**: Supports parallel versions (`v1.0.0`, `v2.0.0`, `next`).
- **Version Aliasing**: Automatic alias resolution (`latest`, `current` mapped to default stable release).
- **Outdated Version Banner**: Detects when visitors view superseded versions and injects non-intrusive warning banners with 1-click links to the latest version.
- **Cross-Version Navigation**: Version switcher dropdown preserves page context when navigating across versions.

### 2.2 Markdown & Admonition Processing Engine
- **YAML Frontmatter**: Extracts `title`, `slug`, `tags`, and ordering indices.
- **Callout Containers**: Transforms custom syntax into alert UI boxes:
  - `:::note` (informative guidelines)
  - `:::tip` (best practices & recommendations)
  - `:::warning` (cautions & alerts)
  - `:::danger` (destructive operations)
- **Table of Contents (TOC)**: Extracts headings (`h2`-`h4`), slugifies unique anchor IDs (`#anchor-id`), and constructs nested TOC trees.

### 2.3 OpenAPI 3.x Ingestion & Interactive Explorer
- **Specification Ingestion**: Reads JSON or YAML OpenAPI 3.0.x / 3.1.x schemas.
- **Endpoint Exploration**: Groups operations by tag, extracts path/query parameters, requestBody schema, and HTTP response codes.
- **cURL Generator**: Generates formatted, runnable cURL command snippets with headers and JSON sample bodies.

### 2.4 Compile-Time Link & Dead Anchor Auditor
- **Graph Link Audit**: Inspects all relative links and hash fragments across all documents.
- **Dead Link Detection**: Flags broken document targets and missing `#heading` anchor IDs prior to static site generation.

### 2.5 Inverted Search Indexer
- **Tokenization & Stop Words**: Removes common stop words, normalizes casing, and stems terms.
- **Relevance Scoring**: Weighted relevance heuristics (Titles: 5.0, Headings: 3.0, Body text: 1.0).
- **Search Snippets**: Generates contextual excerpts with match highlighting (`<mark>keyword</mark>`).

## 3. Non-Functional Requirements
- **Performance**: Static compilation under 500ms for standard 25-page project trees.
- **Determinism**: 100% reproducible static HTML outputs with zero client hydration requirement for readers.
- **Decoupled Architecture**: Stateless FastAPI compiler service backed by PostgreSQL 16 and Redis 7.
