# CMS Platform (WordPress Alternative) — System Architecture

## 1. High-Level Architecture

The CMS Platform is structured as an extensible headless content management engine:
- **Backend API**: Node.js, Express.js, TypeScript, PostgreSQL 16 (Port 4008).
- **Studio Frontend**: Next.js 14 App Router, React, Tailwind CSS (Port 3008).
- **Media Subsystem**: Dedicated local content-addressable storage volume in `media/uploads`.
- **Database**: PostgreSQL 16 (`pixlo_cms_db` on Port 5438).
- **Cache/Queue**: Redis 7 (`redis://localhost:6388/0`).

```
+-------------------------------------------------------------+
|                      Client / Browser                       |
|               Next.js Studio (Port 3008)                    |
+------------------------------+------------------------------+
                               | HTTP / REST API
                               v
+-------------------------------------------------------------+
|                     Express Application                     |
|                         (Port 4008)                         |
|  +--------------------+  +-------------------------------+  |
|  | Routers:           |  | Core Domain Engines:          |  |
|  | - /admin/schemas   |  | - Dynamic Schema Validator    |  |
|  | - /content/:type   |  | - Dynamic Query Engine        |  |
|  | - /media           |  | - Plugin Sandbox (Hooks)      |  |
|  | - /plugins         |  | - Media Asset Manager         |  |
|  | - /tokens          |  | - Token Verification (RBAC)   |  |
|  +--------------------+  +-------------------------------+  |
+--------------+------------------------------+---------------+
               |                              |
               v                              v
+-------------------------------+  +--------------------------+
|          PostgreSQL           |  |   Local Storage Volume   |
|        (pixlo_cms_db)         |  |  media/uploads/          |
|  Schemas, Entries, Media,     |  |  SHA-256 Checksums,      |
|  Plugins, API Tokens, ACL     |  |  Responsive Variants     |
+-------------------------------+  +--------------------------+
```

## 2. Core Domain Services

### 2.1 Dynamic Router & Schema Engine (`src/core/schema-validator.ts`)
- Evaluates content model declarations at runtime.
- Validates field constraints: `required`, `min`, `max`, `regex`, `enum`.
- Type coercion and default value application.

### 2.2 Query Execution Engine (`src/core/dynamic-query.ts`)
- Executes dynamic filtering on arbitrary content models.
- Supports operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$contains`, `$in`.
- Multi-directional sorting, pagination, and field projection.

### 2.3 Sandboxed Plugin & Lifecycle Hooks (`src/core/plugin-sandbox.ts`)
- Dispatches lifecycle events: `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete`.
- Allows plugins to mutate or enrich data payloads before persistence.

### 2.4 Media Storage Subsystem (`src/core/media-manager.ts`)
- Content-addressable SHA-256 storage.
- Generates responsive format variants metadata (`thumbnail`, `medium`, `large`).
- Path traversal defense preventing arbitrary directory write attempts.
