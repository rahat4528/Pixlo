# Documentation Platform — API Reference

Base URL: `http://localhost:4007/api/v1`

## 1. Projects (`/projects`)

### `GET /projects`
List all documentation projects.
- **Response** `200 OK`: Array of Project objects.

### `POST /projects`
Create a new documentation project workspace.
- **Request Body**:
  ```json
  {
    "name": "Acme Cloud Platform",
    "slug": "acme-cloud",
    "description": "Developer platform and distributed runtime docs.",
    "repository_url": "https://github.com/example/acme-cloud",
    "default_version": "v1.0.0"
  }
  ```
- **Response** `201 Created`

### `GET /projects/{project_id}`
Retrieve project details by ID or slug.

### `DELETE /projects/{project_id}`
Delete a project and all associated versions, pages, and build runs.

---

## 2. Versions (`/projects/{project_id}/versions`)

### `GET /projects/{project_id}/versions`
List all versions configured for a project.

### `POST /projects/{project_id}/versions`
Add a documentation version.
- **Request Body**:
  ```json
  {
    "version_string": "v2.0.0",
    "is_prerelease": false,
    "is_deprecated": false,
    "is_default": true
  }
  ```

---

## 3. Pages (`/projects/{project_id}/pages`)

### `GET /projects/{project_id}/pages?version_id=...`
List pages under a specific version.

### `POST /projects/{project_id}/pages`
Create a documentation page.
- **Request Body**:
  ```json
  {
    "version_id": "version-uuid",
    "slug": "getting-started",
    "title": "Getting Started",
    "raw_content": "---\ntitle: Getting Started\n---\n## Installation\nSteps here.",
    "order_index": 1
  }
  ```

### `PUT /pages/{page_id}`
Update page content, re-render markdown, and update TOC.

---

## 4. OpenAPI Specifications (`/projects/{project_id}/api-specs`)

### `POST /projects/{project_id}/api-specs`
Upload and parse OpenAPI 3.x schema (JSON or YAML).
- **Request Body**:
  ```json
  {
    "version_id": "version-uuid",
    "title": "Acme REST API",
    "raw_spec": "openapi: '3.0.0'..."
  }
  ```

---

## 5. Builds & Previews (`/projects/{project_id}/builds`)

### `POST /projects/{project_id}/builds`
Trigger a static generator build across all project versions.
- **Request Body**:
  ```json
  {
    "trigger_type": "MANUAL"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "id": "build-uuid",
    "status": "SUCCESS",
    "total_pages": 24,
    "broken_links_count": 0,
    "build_duration_ms": 380,
    "log_output": "Built 24 pages in 380ms. Broken links: 0."
  }
  ```

---

## 6. Full-Text Search (`/projects/{project_id}/search`)

### `GET /projects/{project_id}/search?q={query}&version={version}`
Query the inverted search index.
- **Response** `200 OK`:
  ```json
  {
    "query": "docker",
    "total_results": 2,
    "results": [
      {
        "id": "uuid",
        "title": "Prerequisites",
        "slug": "prerequisites",
        "version": "v2.0.0",
        "score": 5.0,
        "snippet": "...configure <mark>docker</mark> daemon..."
      }
    ]
  }
  ```
