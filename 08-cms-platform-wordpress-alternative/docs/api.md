# CMS Platform (WordPress Alternative) — API Reference

Base URL: `http://localhost:4008/api/v1`

## 1. Schema Builder (`/admin/schemas`)

### `GET /admin/schemas`
List all registered dynamic content models.
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "name": "Product",
        "singularName": "product",
        "pluralName": "products",
        "fields": [
          { "name": "title", "type": "string", "required": true },
          { "name": "price", "type": "number", "required": true }
        ]
      }
    ],
    "total": 1
  }
  ```

### `POST /admin/schemas`
Register a new dynamic content-type schema.
- **Request Body**:
  ```json
  {
    "name": "Product",
    "singularName": "product",
    "pluralName": "products",
    "fields": [
      { "name": "title", "type": "string", "required": true, "min": 2 },
      { "name": "price", "type": "number", "required": true, "min": 0 },
      { "name": "category", "type": "enumeration", "enumValues": ["Hardware", "Accessories"] }
    ]
  }
  ```
- **Response** `201 Created`

---

## 2. Dynamic Content API (`/content/:contentType`)

### `GET /content/:contentType`
Query entries with dynamic filtering, sorting, and pagination.
- **Query Parameters**:
  - `price[$gt]=100`: Greater-than comparison
  - `title[$contains]=keyboard`: Substring search
  - `sort=price:desc`: Sorting
  - `page=1&pageSize=10`: Pagination
  - `fields=title,price`: Field projection
- **Response** `200 OK`:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "Mechanical Gaming Keyboard",
        "price": 129.99,
        "category": "Hardware",
        "status": "PUBLISHED"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "pageCount": 1
    }
  }
  ```

### `POST /content/:contentType`
Create a new dynamic entry.
- **Request Body**: Dynamic JSON matching the content-type schema.
- **Response** `201 Created` (Enriched with SEO slug and metadata from active plugins).

### `PUT /content/:contentType/:id`
Update an existing entry and increment its version.

### `POST /content/:contentType/:id/publish`
Publish an entry, changing status from `DRAFT` to `PUBLISHED` and setting `publishedAt`.

### `DELETE /content/:contentType/:id`
Delete an entry, triggering `beforeDelete` and `afterDelete` hooks.

---

## 3. Media Subsystem (`/media`)

### `POST /media/upload`
Upload digital asset with MIME validation and SHA-256 deduplication.
- **Request Body**:
  ```json
  {
    "fileName": "photo.png",
    "mimeType": "image/png",
    "base64Content": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA...",
    "altText": "Product hero shot"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "id": "uuid",
    "fileName": "photo.png",
    "fileHash": "sha256-hex-hash",
    "mimeType": "image/png",
    "fileSize": 1420,
    "url": "/media/uploads/sha256-hex-hash.png",
    "formats": {
      "thumbnail": { "width": 150, "height": 150, "url": "..." },
      "medium": { "width": 600, "height": 600, "url": "..." },
      "large": { "width": 1200, "height": 1200, "url": "..." }
    }
  }
  ```

---

## 4. Plugins & Hooks (`/plugins`)

### `GET /plugins`
List installed plugins and active hooks (`beforeCreate`, `afterCreate`, etc.).

### `POST /plugins/:slug/toggle`
Toggle plugin active status.

---

## 5. API Tokens (`/tokens`)

### `POST /tokens`
Generate API key for headless consumers.
- **Request Body**:
  ```json
  {
    "name": "Mobile iOS Client",
    "tokenType": "READ_ONLY"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "token": "cms_live_a1b2c3d4e5f6...",
    "id": "uuid",
    "name": "Mobile iOS Client",
    "tokenType": "READ_ONLY"
  }
  ```
