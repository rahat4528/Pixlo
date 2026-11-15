# Pixlo Note-Taking App — System Architecture

## 1. High-Level Architecture Overview

The Pixlo Note-Taking App is structured as a resilient offline-first productivity platform:
1. **Frontend Client**: Next.js 14 personal workspace featuring a 3-pane layout (Notebook Navigation, Note List, Focused Note Canvas), local offline cache, and sync state indicators.
2. **Backend API**: NestJS server providing RESTful endpoints, JWT session validation, and device session tracking.
3. **Synchronization & Concurrency Engine**: Server-side revision tracking, 3-way text merger, and conflict resolution copy generator.
4. **Data Tier**: PostgreSQL (`pixlo_notes_db` on port 5434) and Redis cache/queue on port 6384.

```
+-----------------------------------------------------------------------+
|                    Next.js 14 Personal Workspace                      |
|  - Notebook & Stack Sidebar           - Note List & Fast Search       |
|  - Focused Note Canvas (Autosave)     - Revision History Drawer       |
|  - Device Session Manager             - Conflict Resolution Views     |
+-----------------------------------+-----------------------------------+
                                    | (HTTPS / REST)
                                    v
+-----------------------------------------------------------------------+
|                         NestJS Backend API                            |
|  - AuthModule (Sessions & RBAC)       - NotesModule (CRUD & Revisions)|
|  - NotebooksModule (Stacks)           - TagsModule                    |
|  - SyncModule (3-Way Merge & Sync)    - ClipperModule (SSRF Guard)    |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
+-----------------------------------+   +-------------------------------+
|      Concurrency & Sync Engine    |   | PostgreSQL (pixlo_notes_db)   |
|  - Monotonic Revision Incrementor |   | - users & device_sessions     |
|  - Stale Write Conflict Detector  |   | - notebooks & notebook_stacks |
|  - 3-Way Line Diff / Merge        |   | - notes & note_revisions      |
|  - Idempotent Sync Record Tracker |   | - tags & note_tags            |
|  - Conflict Copy Brancher         |   | - reminders & sync_records    |
+-----------------------------------+   +-------------------------------+
```

## 2. Optimistic Concurrency & 3-Way Merge Sequence

```
Client A (Device 1)          Server (PostgreSQL)            Client B (Device 2)
      |                              |                              |
      |-- Pull note (Rev 1) -------->|                              |
      |                              |<-- Pull note (Rev 1) --------|
      |                              |                              |
      |-- Edit & Push (Base Rev 1)-->|                              |
      |   (Applies Rev 2)            |                              |
      |<-- 200 OK (Rev 2) -----------|                              |
      |                              |                              |
      |                              |<-- Edit & Push (Base Rev 1)--|
      |                              |    *STALE WRITE DETECTED*    |
      |                              |    (Base 1 < Current 2)      |
      |                              |                              |
      |                              |-- [ 3-Way Diff Evaluation ] -|
      |                              |                              |
      |            +-----------------+----------------+             |
      |            |                                  |             |
      |      [Non-overlapping]                  [Overlapping]       |
      |      Auto-merge text                    Fork Conflict Copy  |
      |      Apply as Rev 3                     Keep Server Rev 2   |
      |            |                                  |             |
      |            v                                  v             |
      |      200 OK (Merged Rev 3)              409 Conflict        |
      |                                         + Return Server Rev |
      |                                         + Return Conflict Copy
```

## 3. Storage & Port Allocation

- Frontend Web: `http://localhost:3004`
- Backend API: `http://localhost:4004` (OpenAPI Swagger at `/api/docs`)
- Database: PostgreSQL on port `5434` (`pixlo_notes_db`)
- Cache/Task Engine: Redis on port `6384`
- Local Storage Directory: `storage/` for attachments and document scans.
