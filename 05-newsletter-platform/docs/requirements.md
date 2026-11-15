# Pixlo Newsletter Platform — Requirements & Specification

## 1. Executive Summary

The Pixlo Newsletter Platform is a high-throughput, audience-driven newsletter publishing and audience relationship engine. It enables creators, independent journalists, and technical writers to manage publications, orchestrate double opt-in subscriber onboarding, compose responsive multi-part email campaigns with merge tags, execute rate-limited bulk dispatches, and track granular deliverability and reader engagement metrics.

## 2. Functional Requirements

### 2.1 Audience Management & Subscriber Lifecycle
- **Double Opt-In Compliance**:
  - Automatically generate cryptographically secure, time-bounded verification tokens for new subscriber signups.
  - Require explicit verification before transitioning a subscriber to `CONFIRMED` status.
  - Maintain an audit trail of signup IP address, creation timestamp, and confirmation timestamp.
- **RFC 8058 One-Click List-Unsubscribe**:
  - Embed standard `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers on all outbound campaign messages.
  - Automatically inject an accessible, styled unsubscribe footer into emails if omitted in user-composed templates.
  - Support instant unsubscribe confirmation without requiring authentication.
- **Suppression Lists & Clean Lists**:
  - Automatically suppress recipients upon permanent hard bounces or spam complaints.
  - Maintain suppression records scoped to each publication.
  - Reject email dispatch to any address present on the publication's suppression list.
  - Track temporary soft bounces with a 3-strike threshold before escalating to permanent suppression.

### 2.2 Content Authoring & Email Templating
- **Template System**:
  - Support reusable HTML and plain-text email templates with responsive desktop and mobile styling.
  - Real-time preview toggle between desktop client view and mobile device view.
- **Dynamic Merge Tags**:
  - `{{subscriber.name}}`: Full subscriber name or friendly fallback.
  - `{{subscriber.firstName}}`: Given name or "Reader".
  - `{{subscriber.lastName}}`: Family name.
  - `{{subscriber.email}}`: Recipient email address.
  - `{{publication.name}}`: Sponsoring publication title.
  - `{{publication.url}}`: Publication homepage link.
  - `{{campaign.subject}}`: Current email subject line.
  - `{{unsubscribe_url}}`: Unique one-click unsubscribe destination.
  - `{{preferences_url}}`: Subscriber preference center link.

### 2.3 Campaign Orchestration & Dispatch Pipeline
- **State Machine Transitions**:
  - Valid transitions: `DRAFT -> SCHEDULED / QUEUED -> SENDING -> SENT` (with `CANCELLED` and `FAILED` branches).
  - Prevent concurrent dispatch runs on the same campaign through database status locking.
- **Delivery Adapters**:
  - Clean multi-provider interface (`EmailDeliveryAdapter`) supporting:
    - In-memory mock adapter for local testing and capture.
    - Standard SMTP adapter.
    - Cloud adapters (Amazon SES, Resend, SendGrid compliant interfaces).
- **Batching & Rate Limiting**:
  - Partition recipients into configurable batch sizes (e.g. 50-250 recipients).
  - Enforce throughput limits (e.g. 50 messages/second) to protect sender reputation and prevent provider rate limiting.

### 2.4 Deliverability & Engagement Analytics
- **Open Tracking**:
  - Inject 1x1 transparent tracking pixel before `</body>`.
  - Record open timestamp, hashed client IP, and User-Agent.
- **Click Tracking**:
  - Rewrite external links with tracking redirect endpoints (`/api/analytics/click?token=...&target=...`).
  - Preserve `mailto:`, `tel:`, `#`, and unsubscribe links without rewriting.
  - Automatically infer email open event if a click occurs before a pixel fetch.
- **Aggregate Metrics**:
  - Calculate sent count, delivered count, unique opens, total opens, open rate (%), unique clicks, total clicks, click-through rate (CTR %), and bounce rate (%).

## 3. Non-Functional Requirements
- **Independence**: 100% self-contained database (`pixlo_newsletter_db`), Redis instance (port `6385`), and isolated port configuration (FE: `3005`, BE: `4005`).
- **Zero Attribution**: Purely original code with zero mentions or links to external reference products.
- **Resilience**: Graceful error handling for bounced recipients without interrupting batch execution.
