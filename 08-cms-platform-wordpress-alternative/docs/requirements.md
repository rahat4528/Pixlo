# CMS Platform (WordPress Alternative) — Requirements Specification

## 1. Overview
The CMS Platform (`08-cms-platform-wordpress-alternative`) is an enterprise-grade, metadata-driven headless content management system. It provides a visual content-type schema builder, automated dynamic REST API generation, a sandboxed plugin and hook lifecycle architecture, a centralized media asset library with responsive variant generation, draft/published content state transitions, and granular API token authentication.

## 2. Functional Requirements

### 2.1 Dynamic Content-Type Schema Builder
- **Model Definition**: Dynamic schemas declaring singular and plural API slugs.
- **Supported Field Types**:
  - `string`: short text with min/max and regex pattern validation.
  - `text`: multiline plain text.
  - `richtext`: formatted HTML/Markdown content.
  - `number`: integers and floating point values with min/max bounds.
  - `boolean`: boolean flags with default states.
  - `date`: ISO timestamp validation.
  - `media`: relation to uploaded digital assets.
  - `enumeration`: constrained selection from an allowable value list.
  - `json`: raw structured payloads.
- **Schema Validation**: Validates dynamic fields and strips unrecognized properties.

### 2.2 Automated Dynamic REST API Generator
- **Zero-Code Endpoint Generation**: Automatically provisions CRUD routes for any registered content model:
  - `GET /api/v1/content/:contentType`: full query engine with filtering (`$eq`, `$gt`, `$contains`, etc.), multi-field sorting, pagination, and projection.
  - `GET /api/v1/content/:contentType/:id`: single entry lookup.
  - `POST /api/v1/content/:contentType`: dynamic entry creation with schema validation.
  - `PUT /api/v1/content/:contentType/:id`: dynamic entry update.
  - `DELETE /api/v1/content/:contentType/:id`: entry deletion.
  - `POST /api/v1/content/:contentType/:id/publish`: toggle draft to published state.

### 2.3 Sandboxed Plugin & Lifecycle Hooks Architecture
- **Hook Dispatcher**: Supports asynchronous lifecycle execution:
  - `beforeCreate`, `afterCreate`
  - `beforeUpdate`, `afterUpdate`
  - `beforeDelete`, `afterDelete`
- **Built-in Plugins**:
  - `SEO Engine`: automatically generates URL-safe slugs from title fields and estimates reading time.
  - `Webhook Dispatcher`: delivers outbound HTTP event notifications on content mutations.

### 2.4 Media Asset Subsystem (`media/`)
- **MIME Verification**: Restricts uploads to safe media types (JPEG, PNG, WebP, GIF, SVG, PDF).
- **Deduplication**: SHA-256 hash checksums ensure storage integrity and prevent duplicates.
- **Variant Generation**: Responsive variant metadata (`thumbnail`: 150x150, `medium`: 600x600, `large`: 1200x1200).
- **Path Traversal Guard**: Sanitizes filenames to block directory escape exploits.

### 2.5 API Tokens & Headless Security
- **Token Generation**: Generates salted, cryptographically hashed tokens (`cms_live_...`).
- **Access Scopes**: Read-only, full-access, and content-scoped permission gating.

## 3. Non-Functional Requirements
- **Performance**: Dynamic REST endpoints respond in < 50ms for paginated queries.
- **Scalability**: Express.js stateless architecture backed by PostgreSQL 16 and Redis 7.
- **Port Isolation**: Backend on port 4008, Studio on port 3008, PostgreSQL on port 5438, Redis on port 6388.
