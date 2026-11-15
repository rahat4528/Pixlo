# Pixlo Repository Overview

## Mission & Purpose
Pixlo is an engineering monorepo containing eight independent, production-grade applications that address the complete lifecycle of digital publishing, content curation, personal and organizational knowledge management, and headless content architecture.

Rather than coupling these domains into a single unwieldy monolith or relying on an overarching centralized CMS, Pixlo demonstrates a strictly decoupled architecture: each application is crafted with deep domain-specific models, distinct UI/UX identities, isolated databases, and purpose-built backends.

## The Eight Independent Domains

1. **Blog Platform (Medium Clone)** (`01-blog-platform-medium-clone`):
   Long-form editorial publication engine designed for writers, publications, and readers. Features structured article revision control, editorial submission pipelines, reading time estimation, author analytics, and personalized discovery feeds.

2. **Recipe Sharing Platform** (`02-recipe-sharing-platform`):
   Structured culinary portal treating recipes as precision data. Provides rational-arithmetic scaling across volume and mass dimensions, cooking-step execution mode, automated shopping list compilation, and weekly meal planning grids.

3. **News Aggregator** (`03-news-aggregator`):
   Autonomous syndication and news curation system. Employs SSRF-protected feed fetchers, canonical URL normalization, title hashing, story clustering, and category feeds.

4. **Note-Taking App (Evernote Clone)** (`04-note-taking-app-evernote-clone`):
   Personal knowledge and productivity workspace. Employs optimistic revision tracking, conflict detection, offline IndexedDB sync queues, full-text search indexing, and rich media capture.

5. **Newsletter Platform** (`05-newsletter-platform`):
   Consent-driven audience broadcast system. Features verified double opt-in subscriber onboarding, RFC-compliant one-click unsubscription headers, campaign pipelines, and background delivery workers.

6. **Wiki System** (`06-wiki-system`):
   Hierarchical team knowledge base. Features role-based and node-level inheritance permissions, bidirectional wiki backlinks, revision diffs, and content approval pipelines.

7. **Documentation Platform** (`07-documentation-platform`):
   Developer technical documentation platform featuring an isolated Markdown/MDX static site generator, multi-version switcher, OpenAPI 3.x ingestion, automated broken-link detection, and deployment lifecycle.

8. **CMS Platform (WordPress Alternative)** (`08-cms-platform-wordpress-alternative`):
   Metadata-driven headless content management system. Features dynamic schema builders, automatic REST API generation, media management, and plugin extension hooks.
