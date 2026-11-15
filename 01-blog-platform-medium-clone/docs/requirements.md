# Blog Platform (Medium Clone) — Requirements Specification

## 1. Domain Purpose
The Blog Platform provides a focused, high-craft editorial publishing environment for authors and an immersive, distraction-free reading experience for readers. It supports independent authors and collaborative multi-author publications, featuring structured article lifecycles, revision tracking, editorial reviews, engagement loops (reactions, nested discussions, bookmarks), reading history tracking, personalized feed scoring, and author analytics.

It is strictly dedicated to article publishing and author-reader ecosystems; it does not serve as a generic headless CMS nor as a bulk newsletter broadcaster.

---

## 2. Functional Requirements

### 2.1 Identity, Profiles & Following
- **Registration & Authentication**: Email and password registration with bcrypt/Argon2 hashing; secure JWT access token issuing and refresh tokens.
- **Author Profiles**: Display name, username, bio, avatar URL, social links, and total follower/following counts.
- **Author Following**: Bi-directional follow graph allowing readers to follow favorite writers and publications.
- **Public Author Pages**: Chronological list of published articles, featured pinned story, and author bio.

### 2.2 Editorial Creation & Rich Content
- **Structured Editor**: Rich-text block-based composition supporting headings (H1-H4), blockquotes, code blocks with syntax highlighting, lists, divider rules, and embedded images.
- **Metadata Management**: Custom URL slugs, SEO title/description overrides, cover images with attribution, categories, and tags.
- **Reading Time Estimation**: Computed using a deterministic 200 words-per-minute (WPM) baseline with an additional 12 seconds per inline image and 10 seconds per code block.
- **Draft & Revision Management**: Automatic debounced autosave. Each manual or checkpoint save generates an immutable `ArticleRevision`. Authors can inspect past revisions and restore previous drafts.
- **Draft Privacy**: Drafts and pending submissions are strictly inaccessible to the public or unauthorized users.

### 2.3 Article State Machine & Publication Workflows
The platform implements an explicit state machine for article lifecycles:
```
DRAFT -> SUBMITTED -> IN_REVIEW -> (CHANGES_REQUESTED | APPROVED) -> SCHEDULED -> PUBLISHED -> UNPUBLISHED
```
- **Independent Author Flow**: An author publishing outside a publication can transition directly from `DRAFT` to `PUBLISHED` or `SCHEDULED`.
- **Publication Editorial Flow**: Articles submitted to a multi-author publication transition into `SUBMITTED`. Editors and Owners can review, request revisions (`CHANGES_REQUESTED`), or approve (`APPROVED`) and publish.
- **Publication Roles**:
  - `OWNER`: Full administrative authority, member management, publishing rights.
  - `EDITOR`: Review submissions, request changes, approve, publish, edit any article in the publication.
  - `WRITER`: Draft and submit articles to the publication. Cannot publish directly.
- **Scheduled Publishing**: Articles marked with a future publish timestamp enter `SCHEDULED` state and are transitioned to `PUBLISHED` via an idempotent scheduling worker.

### 2.4 Reading Experience & Personalized Feeds
- **Discovery**: Featured stories, curated topics, latest published articles, and trending stories.
- **Personalized Feed Algorithm**:
  - Scores articles based on:
    - Author followings (weight: +40)
    - Tag affinity from user reading history (weight: +25)
    - Publication membership (weight: +20)
    - Recency decay (exponential half-life decay over 7 days)
  - Uses cursor-based pagination for high performance.
- **Reading Lists & Bookmarks**: Save stories to default "Reading List" or custom collections with private/public visibility.
- **Reading History**: Tracks viewed articles with timestamp and scroll depth.

### 2.5 Engagement & Community
- **Reactions**: Multi-reaction support (Applause, Insightful, Heart) with per-user limits and deduplication.
- **Comments & Replies**: Threaded discussions on published articles with parent-child hierarchy.
- **Moderation**: Authors and publication editors can report, hide, or delete abusive comments.
- **Social Sharing**: One-click social sharing links and Web Share API integrations.

### 2.6 Author Analytics & Paywall Access Control
- **Deduplicated Analytics**: Unique session-based view counting and scroll depth completion tracking.
- **Author Dashboard**: Aggregated views, total reading minutes, applause counts, and top-performing articles.
- **Optional Paid Memberships**:
  - Authors or publications can mark stories as `MEMBERS_ONLY`.
  - Non-members receive a truncated teaser preview (first 2 paragraphs). The server strictly excludes full article content at the API level (never just hidden in CSS).
  - Sandbox payment adapter for membership status verification.

### 2.7 SEO & Syndication
- Open Graph cards, Twitter Cards, canonical URL tags.
- Schema.org `Article` / `NewsArticle` JSON-LD structured data.
- Dynamic `sitemap.xml` for published articles and authors.
- Standard RSS 2.0 / Atom feeds per author and per publication.
