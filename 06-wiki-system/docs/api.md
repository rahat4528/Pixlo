# Wiki System — API Reference

Base URL: `http://localhost:4006/api/v1`

## 1. Authentication (`/auth`)

### `POST /auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@pixlo.local",
    "password": "SecurePassword123!",
    "full_name": "Jane Doe"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "id": "uuid",
    "email": "user@pixlo.local",
    "full_name": "Jane Doe",
    "is_active": true
  }
  ```

### `POST /auth/login`
Authenticate and obtain a JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "user@pixlo.local",
    "password": "SecurePassword123!"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access_token": "jwt-token-string",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

---

## 2. Spaces (`/spaces`)

### `GET /spaces`
List all accessible spaces.
- **Headers**: `Authorization: Bearer <token>`
- **Response** `200 OK`: Array of Space objects.

### `POST /spaces`
Create a new wiki space.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Engineering Knowledge Base",
    "slug": "engineering",
    "description": "Core architecture, API standards, and infrastructure guides.",
    "visibility": "PUBLIC"
  }
  ```

### `GET /spaces/{slug}`
Get space details, including member counts and statistics.

### `GET /spaces/{slug}/tree`
Get the hierarchical page tree for the space.
- **Response** `200 OK`: Nested array of pages with `id`, `slug`, `title`, and `children`.

---

## 3. Pages & Revisions (`/pages`)

### `POST /pages`
Create a new page in a space.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "space_id": "space-uuid",
    "parent_id": null,
    "title": "Architecture Overview",
    "slug": "architecture-overview",
    "content": "Refer to [[database-standards|Database Guide]] for details.",
    "change_summary": "Initial draft"
  }
  ```

### `GET /pages/{page_id}`
Retrieve page content, author info, current revision, and metadata.

### `PUT /pages/{page_id}`
Update page content and create a new revision.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Architecture Overview v2",
    "content": "Updated content with [[security-policy|Security Policies]].",
    "change_summary": "Added security policies link"
  }
  ```

### `GET /pages/{page_id}/revisions`
Get full revision history for a page.

### `GET /pages/{page_id}/diff?from_rev=1&to_rev=2`
Compute line-by-line diff between two revisions.
- **Response** `200 OK`:
  ```json
  {
    "from_revision": 1,
    "to_revision": 2,
    "lines_added": 3,
    "lines_deleted": 1,
    "diff_lines": [
      { "type": "context", "text": "Common header line" },
      { "type": "delete", "text": "- Old statement" },
      { "type": "add", "text": "+ Updated statement" }
    ]
  }
  ```

### `POST /pages/{page_id}/rollback`
Restore an older revision as the active page content.
- **Request Body**:
  ```json
  {
    "target_revision_number": 1,
    "reason": "Reverting broken specification"
  }
  ```

### `GET /pages/{page_id}/backlinks`
Get incoming and outgoing links for the page.
- **Response** `200 OK`:
  ```json
  {
    "page_id": "page-uuid",
    "outgoing_links": [
      { "target_slug": "database-standards", "anchor_text": "Database Guide" }
    ],
    "incoming_links": [
      { "source_page_id": "uuid", "source_title": "Onboarding Guide" }
    ]
  }
  ```

---

## 4. Approvals (`/approvals`)

### `GET /approvals/pending`
List all revision proposals awaiting editorial review.

### `POST /approvals/{approval_id}/decide`
Approve or reject a proposed revision.
- **Request Body**:
  ```json
  {
    "decision": "APPROVED",
    "review_notes": "Looks solid, ready to publish."
  }
  ```

---

## 5. Storage (`/storage`)

### `POST /storage/upload`
Upload an image or attachment.
- **Form Data**: `file` (multipart/form-data)
- **Response** `201 Created`:
  ```json
  {
    "file_id": "sha256-hash",
    "original_name": "diagram.png",
    "size_bytes": 45120,
    "mime_type": "image/png",
    "url": "/storage/files/sha256-hash.png"
  }
  ```
