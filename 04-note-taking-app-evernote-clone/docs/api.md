# Pixlo Note-Taking App — REST API Specification

Base URL: `http://localhost:4004/api`  
Swagger Documentation: `http://localhost:4004/api/docs`

## 1. Authentication & Sessions

### 1.1 Register
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**: `{"email": "alex@pixlo.io", "password": "Password123!", "displayName": "Alex Thorne"}`
- **Response**: `201 Created`

### 1.2 Login & Device Tracking
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**: `{"email": "alex@pixlo.io", "password": "Password123!", "deviceId": "macbook-m3", "deviceName": "MacBook Pro"}`
- **Response**: `200 OK`

### 1.3 List Device Sessions
- **Method**: `GET`
- **Path**: `/auth/sessions`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 1.4 Revoke Device Session
- **Method**: `POST`
- **Path**: `/auth/sessions/:deviceId/revoke`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Notebooks & Stacks

### 2.1 List Notebooks and Stacks
- **Method**: `GET`
- **Path**: `/notebooks`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 2.2 Create Notebook
- **Method**: `POST`
- **Path**: `/notebooks`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"name": "System Architecture", "color": "#2563eb", "stackId": "stack-uuid"}`
- **Response**: `201 Created`

### 2.3 Create Stack
- **Method**: `POST`
- **Path**: `/notebooks/stacks`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"name": "Engineering"}`
- **Response**: `201 Created`

---

## 3. Notes & Revisions

### 3.1 List Notes
- **Method**: `GET`
- **Path**: `/notes`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `notebookId`, `tagId`, `isStarred`, `isPinned`, `isArchived`, `isTrashed`, `q`
- **Response**: `200 OK`

### 3.2 Create Note
- **Method**: `POST`
- **Path**: `/notes`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"title": "Sprint Retrospective", "content": "# Retro Notes", "notebookId": "uuid"}`
- **Response**: `201 Created` (revision 1)

### 3.3 Update Note with Concurrency Check
- **Method**: `PUT`
- **Path**: `/notes/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Sprint Retrospective [Updated]",
    "content": "# Retro Notes\n- High velocity",
    "baseRevision": 1
  }
  ```
- **Response**:
  - `200 OK`: Stored as Revision 2.
  - `409 Conflict`: If server is on revision 2+, returns current server content.

### 3.4 Restore Revision
- **Method**: `POST`
- **Path**: `/notes/:id/revisions/:revision/restore`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` (creates new revision snapshot with reason `RESTORED`)

### 3.5 Export Note to Markdown
- **Method**: `GET`
- **Path**: `/notes/:id/export/markdown`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` (`text/markdown` file with YAML frontmatter)

---

## 4. Synchronization Engine

### 4.1 Push Offline Operations
- **Method**: `POST`
- **Path**: `/sync/push`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "deviceId": "macbook-m3",
    "operations": [
      {
        "clientOpId": "op-12345",
        "noteId": "note-uuid-1",
        "operation": "UPDATE",
        "baseRevision": 2,
        "content": "Updated content from offline edit"
      }
    ]
  }
  ```
- **Response**: `200 OK` with per-operation results (`APPLIED`, `CONFLICT`, or `REJECTED`).

### 4.2 Pull Modified Notes
- **Method**: `GET`
- **Path**: `/sync/pull?since=2026-11-16T00:00:00Z`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 5. Web Clipper

### 5.1 Clip Web Article (SSRF-Protected)
- **Method**: `POST`
- **Path**: `/clipper`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{"url": "https://example.com/article", "notebookId": "uuid"}`
- **Response**: `201 Created`
