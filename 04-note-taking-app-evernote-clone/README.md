# Note-Taking App (Evernote Clone)

A private personal note management and knowledge capture platform. It combines notebook and hierarchical stack organization, tagging taxonomies, offline-first note composition with debounced autosave, browsable revision history, and an optimistic concurrency engine featuring automated 3-way text merging and conflict copies.

---

## 1. Features

- **Notebook Stacks & Hierarchies**: Organize notes into notebooks and group related notebooks into stacks (e.g. Work, Personal, Research).
- **Optimistic Concurrency & Revision Checks**: Every note maintains a strict integer `serverRevision`. Client edits declare their `baseRevision`. Stale writes are never applied silently, returning HTTP 409 Conflict with the server's current state.
- **3-Way Line Diff & Automatic Merger**: Non-overlapping edits between base, local, and remote versions merge cleanly without user intervention.
- **Non-Destructive Conflict Copies**: Overlapping edits safely branch into a timestamped conflict copy (`[Conflict Copy] <Title>`) so user work is never lost.
- **Offline FIFO Sync Queue**: Edits made while offline queue locally with unique `clientOpId`s, replaying in strict chronological order with exponential backoff on network failure.
- **Debounced Autosave**: Automatic saving triggers after typing pauses, with clear sync indicators (`LOCAL_ONLY`, `PENDING_SYNC`, `SYNCING`, `SYNCED`, `CONFLICT`).
- **Browsable Revision History**: Restoring any historical revision creates a new immutable revision snapshot, preserving full audit history.
- **Device Sessions Management**: View active sessions with device name, platform, IP address, and last sync timestamp; revoke sessions on demand.
- **SSRF-Protected Web Clipper**: Clip articles and web pages safely into your inbox notebook with hostile script stripping and attribution links.
- **Markdown Portability**: One-click export of notes to portable Markdown files with YAML frontmatter.

---

## 2. Architecture & Technology Stack

| Component | Technology | Port |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons | `3004` |
| **Backend API** | NestJS, TypeScript, Passport JWT, Swagger / OpenAPI | `4004` |
| **Database** | PostgreSQL (`pixlo_notes_db`), Prisma ORM | `5434` |
| **Cache & Queue** | Redis | `6384` |
| **Sync Engine** | Custom 3-way diff merger, FIFO queue manager, SSRF clipper | Embedded |

---

## 3. Directory Structure

```
04-note-taking-app-evernote-clone/
  .env.example                 # Configuration template
  docker-compose.yml           # PostgreSQL (5434) & Redis (6384)
  README.md                    # Project documentation
  storage/                     # Local storage for attachments and scans
  database/
    schema.prisma              # Data models and relations
    seeds/
      seed.ts                  # Seed script with notebooks, tags & revisions
  sync/                        # Core synchronization primitives
    conflict-resolver.ts       # 3-way line merger & conflict copy generator
    sync-queue.ts              # Offline FIFO queue manager & idempotency
    web-clipper.ts             # SSRF-protected web clipper & sanitizer
    markdown-exporter.ts       # Portable Markdown export with YAML frontmatter
  backend/                     # NestJS API application
    src/
      modules/
        auth/                  # Identity, JWT & device sessions
        notebooks/             # Notebooks and stacks
        tags/                  # Tag taxonomies
        notes/                 # Note composition, revisions & trash
        sync/                  # Sync endpoints & optimistic concurrency
        clipper/               # Web clipping service
  frontend/                    # Next.js personal productivity workspace
    src/
      app/
        page.tsx               # 3-pane personal workspace & note editor
        sessions/              # Active device session management
        layout.tsx             # Workspace shell layout
  tests/                       # End-to-end concurrency & sync test suites
  docs/                        # Engineering documentation
    requirements.md            # Functional & non-functional requirements
    architecture.md            # System topology & concurrency sequence
    api.md                     # REST API reference
    completion-report.md       # Phase verification sign-off
```

---

## 4. Local Setup & Execution

### 4.1 Start Infrastructure Containers
```bash
docker compose up -d
```
Starts PostgreSQL on port `5434` and Redis on port `6384`.

### 4.2 Configure and Seed Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:seed
npm run start:dev
```
Backend API will be accessible on `http://localhost:4004`.  
Swagger OpenAPI explorer: `http://localhost:4004/api/docs`.

### 4.3 Start Workspace Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Workspace frontend will be accessible on `http://localhost:3004`.

---

## 5. Running Tests

```bash
cd backend
npm test
```
Executes all unit, integration, optimistic concurrency, and 3-way merge test suites.

---

## 6. Database Backup & Restore

### Backup
```bash
docker exec -t pixlo_notes_postgres pg_dump -U postgres pixlo_notes_db > pixlo_notes_db_backup.sql
```

### Restore
```bash
docker exec -i pixlo_notes_postgres psql -U postgres -d pixlo_notes_db < pixlo_notes_db_backup.sql
```
