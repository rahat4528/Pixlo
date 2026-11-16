# Wiki System — Requirements Specification

## 1. Overview
The Wiki System (`06-wiki-system`) is an enterprise-grade knowledge management and collaborative documentation platform. It provides hierarchical space partitioning, page versioning with diff calculation, automated bidirectional backlink indexing (`[[slug|label]]`), granular role-based access control with page-level overrides, an editorial approval workflow, and a local SHA-256 asset management storage engine.

## 2. Functional Requirements

### 2.1 Space Partitioning & Access Control
- **Spaces**: Root-level containers (`slug`, `title`, `description`, `visibility`).
- **Visibility Levels**:
  - `PUBLIC`: Readable by all authenticated users; writable by Space Collaborators/Admins.
  - `INTERNAL`: Organization-wide view; write restricted to Space Members.
  - `RESTRICTED`: Explicit permission grant required.
  - `PRIVATE`: Strictly accessible only to members explicitly mapped to the space.
- **Roles & Hierarchies**: `ADMIN` > `EDITOR` > `COLLABORATOR` > `VIEWER`.
- **Page Permission Overrides**: Specific pages can override parent space permissions with custom ACLs or restrictions (`INHERIT`, `SPACE_ROLE`, `CUSTOM`).

### 2.2 Hierarchical Page Tree & Versioning
- **Tree Hierarchy**: Pages feature parent-child relationships (`parent_id`) allowing infinite nested document trees.
- **Revisions**:
  - Every update generates an immutable `WikiRevision` with revision number, author ID, markdown content, change summary, and timestamp.
  - Fast unified line diffing (`difflib`) computing added, removed, and context lines between any two revisions.
  - Rollback capability to restore any historical revision as the current active version.

### 2.3 Backlink Reconciliation Engine
- **Wiki-Links**: Supports standard internal wiki syntax `[[target-page-slug|Custom Label]]` as well as standard markdown links.
- **Graph Indexing**: On every page save, outgoing links are extracted and cross-referenced against existing pages.
- **Bidirectional Graph**: Pages display forward links (pages linked from this page) and backward links (incoming references from other pages).

### 2.4 Editorial Review & Approval Workflow
- **Approval States**: `DRAFT` -> `IN_REVIEW` -> `PUBLISHED` / `REJECTED`.
- **Review Queue**: Designated editors and admins can view pending proposals, inspect diffs, and approve or reject revisions with editorial feedback.

### 2.5 Local Asset Storage Engine
- **Storage Subsystem**: Located in `storage/asset_manager.py`.
- **Security Validations**:
  - MIME type verification (JPEG, PNG, WebP, PDF, Markdown).
  - Maximum size enforcement (10 MB).
  - File content SHA-256 hashing to avoid duplicates and ensure integrity.
  - Strict path traversal sanitization.

## 3. Non-Functional Requirements
- **Performance**: API response times < 80ms for tree and page lookups. Diff calculation < 30ms for standard documents.
- **Scalability**: Stateless FastAPI app backed by PostgreSQL and Redis.
- **Security**: JWT Bearer token authentication, bcrypt password hashing, input sanitization, and zero foreign-key bypass.
