# Wiki System — System Architecture

## 1. High-Level Architecture

The Wiki System uses a decoupled, modern architecture:
- **Frontend**: Next.js 14 App Router, React, Tailwind CSS, TypeScript (Port 3006).
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT (Port 4006).
- **Storage Subsystem**: Dedicated local content-addressable storage engine (`storage/asset_manager.py`).
- **Database**: PostgreSQL 16 (`pixlo_wiki_db` on Port 5436) / SQLite for local unit testing.
- **Cache & Queue**: Redis 7 (`redis://localhost:6386/0`).

```
+-------------------------------------------------------------+
|                      Client / Browser                       |
|               Next.js App Router (Port 3006)                |
+------------------------------+------------------------------+
                               | HTTP / REST API
                               v
+-------------------------------------------------------------+
|                     FastAPI Application                     |
|                         (Port 4006)                         |
|  +--------------------+  +-------------------------------+  |
|  | Routers:           |  | Core Domain Engines:          |  |
|  | - /auth            |  | - Diff Engine (difflib)       |  |
|  | - /spaces          |  | - Backlink Graph Engine       |  |
|  | - /pages           |  | - Permissions Engine (RBAC)   |  |
|  | - /approvals       |  | - Approval State Machine      |  |
|  | - /storage         |  | - Asset Manager (SHA-256)     |  |
|  +--------------------+  +-------------------------------+  |
+--------------+------------------------------+---------------+
               |                              |
               v                              v
+-------------------------------+  +--------------------------+
|          PostgreSQL           |  |   Local Storage Volume   |
|       (pixlo_wiki_db)         |  |   06-wiki-system/storage |
|   Spaces, Pages, Revisions,   |  |   SHA-256 Content Addr   |
|    Members, Backlinks, ACL    |  +--------------------------+
+-------------------------------+
```

## 2. Core Domain Services

### 2.1 Diff Engine (`backend/app/services/diff_engine.py`)
- Leverages Python's native `difflib.unified_diff` to generate unified line diffs between any two historical revisions.
- Parses unified diff hunks to calculate structured additions, deletions, line numbers, and unchanged context lines.
- Generates preview payloads for rollbacks and editorial approval reviews.

### 2.2 Backlink Reconciliation Engine (`backend/app/services/backlinks.py`)
- Analyzes markdown content with regex parsers targeting:
  - Wiki-links: `\[\[([a-zA-Z0-9_-]+)(?:\|([^\]]+))?\]\]`
  - Markdown links: `\[([^\]]+)\]\(([^)]+)\)`
- Automatically maps discovered slugs to existing pages in the space.
- Persists links in the `wiki_backlinks` table, maintaining an up-to-date directed graph of incoming and outgoing page relationships.

### 2.3 Access Control & Permissions Engine (`backend/app/services/permissions.py`)
- Hierarchical space-level roles: `ADMIN` > `EDITOR` > `COLLABORATOR` > `VIEWER`.
- Dynamic inheritance: Child pages inherit permissions from parent spaces unless overridden.
- Page-level overrides allow restricting sensitive documentation to specific users or teams.

### 2.4 Asset Storage Manager (`storage/asset_manager.py`)
- Content-addressable storage using SHA-256 checksums to eliminate duplicate uploads.
- Path traversal defense preventing directory breakout attacks.
- Strict MIME and file extension validation.
