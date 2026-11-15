# Pixlo Newsletter Platform — REST API Specification

All API endpoints are hosted at `http://localhost:4005/api` and documented interactively via Swagger OpenAPI at `http://localhost:4005/api/docs`.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new creator user account.
- **Request Body**:
  ```json
  {
    "email": "creator@pixlonewsletter.local",
    "password": "Password123!",
    "name": "Sarah Publisher"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "uuid",
    "email": "creator@pixlonewsletter.local",
    "name": "Sarah Publisher",
    "role": "CREATOR",
    "token": "jwt-access-token"
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns an access token.
- **Request Body**:
  ```json
  {
    "email": "creator@pixlonewsletter.local",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "creator@pixlonewsletter.local",
      "name": "Sarah Publisher",
      "role": "CREATOR"
    }
  }
  ```

---

## 2. Publications (`/api/publications`)

### `GET /api/publications`
List publications owned by authenticated creator.
- **Headers**: `Authorization: Bearer <jwt>`
- **Response `200 OK`**: Array of publication objects.

### `GET /api/publications/:slug`
Public publication profile with branding and subscription configuration.
- **Response `200 OK`**: Publication detail with active subscriber counts.

### `POST /api/publications`
Create a new publication.
- **Request Body**:
  ```json
  {
    "name": "The Weekly Disruption",
    "slug": "weekly-disruption",
    "description": "Deep dives on modern software architecture",
    "senderName": "Sarah",
    "senderEmail": "sarah@disruption.pixlo.local",
    "doubleOptIn": true
  }
  ```

---

## 3. Subscribers (`/api/subscribers`)

### `POST /api/subscribers/subscribe`
Public signup endpoint initiating double opt-in verification.
- **Request Body**:
  ```json
  {
    "publicationId": "uuid",
    "email": "reader@example.com",
    "firstName": "Alex",
    "lastName": "Rivera"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "PENDING_CONFIRMATION",
    "message": "Confirmation link dispatched to reader@example.com"
  }
  ```

### `GET /api/subscribers/confirm?token=<verification-token>`
Validates token and confirms subscription.
- **Response `200 OK`**:
  ```json
  {
    "status": "CONFIRMED",
    "confirmedAt": "2026-02-15T10:00:00Z"
  }
  ```

### `GET /api/subscribers/unsubscribe?token=<tracking-token>`
RFC 8058 compliant one-click unsubscribe destination.
- **Response `200 OK`**:
  ```json
  {
    "status": "UNSUBSCRIBED",
    "message": "You have been successfully removed from this publication."
  }
  ```

### `GET /api/subscribers`
Creator query endpoint for audience list with search, status filter, and pagination.
- **Query Params**: `publicationId`, `status` (PENDING_CONFIRMATION | CONFIRMED | UNSUBSCRIBED | CLEANED), `search`, `page`, `limit`.

---

## 4. Campaigns (`/api/campaigns`)

### `GET /api/campaigns?publicationId=<id>`
List all drafts, scheduled, and dispatched campaigns.

### `POST /api/campaigns`
Create a draft campaign.
- **Request Body**:
  ```json
  {
    "publicationId": "uuid",
    "title": "Issue #43: Resilient Queue Architectures",
    "subject": "Issue #43: High-throughput backpressure and message deduplication",
    "previewText": "Architectural principles for event queues",
    "htmlBody": "<h2>High-throughput queues</h2><p>Hello {{subscriber.firstName}}...</p>",
    "plainTextBody": "Issue #43: High-throughput backpressure..."
  }
  ```

### `POST /api/campaigns/:id/send-test`
Dispatches a preview test email to author.
- **Request Body**: `{ "recipientEmail": "creator@pixlonewsletter.local" }`

### `POST /api/campaigns/:id/dispatch`
Transitions status to `QUEUED` and kicks off worker batch pipeline.
- **Response `202 Accepted`**:
  ```json
  {
    "status": "QUEUED",
    "totalRecipients": 1420
  }
  ```

---

## 5. Deliverability & Analytics (`/api/analytics`)

### `GET /api/analytics/pixel/:token.png`
Delivers 1x1 transparent PNG (`image/png`) and increments recipient open counter with IP hash and User-Agent.

### `GET /api/analytics/click?token=<token>&target=<url>`
Logs unique click event, increments recipient click counter, and issues `302 Found` redirect to target URL.

### `GET /api/analytics/campaigns/:id/overview`
Aggregated engagement performance:
```json
{
  "totalRecipients": 1420,
  "sentCount": 1420,
  "deliveredCount": 1416,
  "bounceCount": 4,
  "uniqueOpens": 892,
  "openRate": 63.0,
  "uniqueClicks": 412,
  "clickThroughRate": 29.1,
  "clickToOpenRate": 46.2,
  "unsubscribeCount": 3
}
```
