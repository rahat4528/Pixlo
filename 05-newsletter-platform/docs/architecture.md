# Pixlo Newsletter Platform — Architectural Specification

## 1. System Overview

The Pixlo Newsletter Platform is engineered as a decoupled, event-driven publishing and broadcasting system. It cleanly separates interactive authoring and subscriber lifecycle management from high-throughput background dispatch and deliverability tracking.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Frontend                  │
│       Creator Studio & Public Publication Landing      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Port 4005)
┌───────────────────────────▼────────────────────────────┐
│                  NestJS Domain API                     │
│  ┌────────────┐ ┌─────────────┐ ┌────────────────────┐ │
│  │ Auth & Pub │ │ Subscribers │ │ Templates & Compose│ │
│  └────────────┘ └─────────────┘ └────────────────────┘ │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │ Campaign Dispatcher   │   │ Analytics & Pixels    │ │
│  └───────────────────────┘   └───────────────────────┘ │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│  PostgreSQL (Port 5435) │  │    Redis (Port 6385)    │
│  pixlo_newsletter_db    │  │  Queue & Rate Limiting   │
└─────────────────────────┘  └─────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│            Background Dispatch Worker Pipeline         │
│  ┌────────────────────┐     ┌───────────────────────┐  │
│  │ Suppression Filter │ ──► │  Template Renderer    │  │
│  └────────────────────┘     │  (Merge Tags & Headers)│ │
│                             └───────────┬───────────┘  │
│                                         ▼              │
│                             ┌───────────────────────┐  │
│                             │ Delivery Adapter Pool │  │
│                             │ (Mock / SMTP / SES)   │  │
│                             └───────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## 2. Component Design

### 2.1 Domain Data Model (`pixlo_newsletter_db`)
- `User`: Platform credentials and role authorization (Admin vs Creator).
- `Publication`: Scoped newsletter brand, verification sender settings, double opt-in toggle, and custom templates.
- `Subscriber`: Individual recipient records with lifecycle status (`PENDING_CONFIRMATION`, `CONFIRMED`, `UNSUBSCRIBED`, `CLEANED`).
- `SubscriberList`: Logical segment groupings for targeted campaigns.
- `Campaign`: Email broadcast instance tracking state machine, scheduled times, and aggregate delivery counters.
- `CampaignRecipient`: Per-recipient message state with unique cryptographic tracking tokens.
- `EmailEvent`: Time-series append-only log capturing `DELIVERED`, `OPEN`, `CLICK`, `BOUNCE`, `COMPLAINT`, and `UNSUBSCRIBE` events.
- `SuppressionEntry`: Publication-scoped blocklist preventing dispatch to bounced or unsubscribed addresses.

### 2.2 Template Engine & RFC 8058 Compliance
- The `EmailTemplateEngine` processes template markup with dictionary-based merge tag resolution.
- Enforces mandatory unsubscribe mechanisms:
  - If a template author fails to place an unsubscribe link, the engine injects a standardized, accessible unsubscribe footer before the closing `</body>` tag.
  - Adds RFC 8058 compliant headers:
    - `List-Unsubscribe: <https://.../api/subscribers/unsubscribe?token=...>`
    - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
    - `Precedence: bulk`

### 2.3 Delivery Worker & Fault Tolerance
- **Batching & Rate Limiting**: Batches are dispatched in worker chunks respecting configured transactions-per-second constraints.
- **Fail-Safe Suppression Check**: Re-evaluates recipient addresses against active suppression entries immediately prior to calling the transport adapter.
- **Bounce & Complaint Processing**:
  - Hard bounces immediately suppress the recipient address and transition subscriber status to `CLEANED`.
  - Spam complaints immediately suppress the recipient address and transition subscriber status to `UNSUBSCRIBED`.
  - Soft bounces are recorded in an incremental fault map; exceeding three soft bounces triggers automatic escalation to permanent suppression.
