# Pixlo Note-Taking App — Requirements Specification

## 1. Executive Summary

Pixlo Note-Taking App (`04-note-taking-app-evernote-clone`) is a personal knowledge capture and private productivity workspace. It provides notebook and hierarchical tag organization, offline-first note composition with debounced autosaving, restorable revision histories, and an optimistic concurrency synchronization engine that enforces strict server revision checks, automated 3-way text merging, and non-destructive conflict copy generation.

## 2. Functional Requirements

### 2.1 Workspace & Notebook Organization
- **FR-1.1 Notebook Management**: Users can create, color-code, and organize notebooks. A default "Inbox" notebook captures unassigned notes.
- **FR-1.2 Notebook Stacks**: Multiple notebooks can be grouped into hierarchical Notebook Stacks (e.g., "Engineering & Work", "Personal & Knowledge").
- **FR-1.3 Tagging Taxonomy**: Multi-tag assignment per note, tag slugification, color tagging, and tag filtering across all notebooks.
- **FR-1.4 View Filters**: Fast workspace filtering by Starred, Pinned, Reminders, and Trash.

### 2.2 Note Composition & Rich Media
- **FR-2.1 Structured Note Editing**: Markdown headings, checklists (`- [ ]`, `- [x]`), syntax-highlighted code blocks, tables, and dividers.
- **FR-2.2 Debounced Autosave**: Automatic saving triggers after user typing pauses, with visual indicators ("Autosaved", "Saving...").
- **FR-2.3 Revisions History**: Every save captures a discrete revision snapshot with metadata (timestamp, reason: `AUTOSAVE`, `MANUAL_SAVE`, `CONFLICT_COPY`, `RESTORED`). Users can browse and restore any historical revision.
- **FR-2.4 Trash Retention & Recovery**: Soft-delete transitions notes to Trash with `trashedAt` timestamps; notes can be restored to their original notebook or permanently purged.

### 2.3 Optimistic Concurrency & Synchronization
- **FR-3.1 Monotonic Revision Tracking**: Each note maintains a strict integer `serverRevision` on PostgreSQL.
- **FR-3.2 Stale Write Rejection**: When clients push updates with a `baseRevision` lower than `serverRevision`, the server rejects silent overwrites with HTTP 409 Conflict.
- **FR-3.3 3-Way Merge Engine**: Non-overlapping diffs between base, local, and remote versions are automatically resolved and saved to canonical state.
- **FR-3.4 Conflict Copy Preservation**: Overlapping conflicting diffs branch into an explicit conflict note (`[Conflict Copy] <Title>`) so that user data is never lost.
- **FR-3.5 Offline FIFO Queue**: Client operations enqueue locally with unique `clientOpId`s, replaying in strict order upon reconnection with idempotent processing.

### 2.4 Device Session Management
- **FR-4.1 Session Auditing**: Tracks all connected devices with device ID, platform, IP address, and last sync timestamp.
- **FR-4.2 Session Revocation**: Users can revoke any device session immediately.

### 2.5 Security, Web Clipping & Portability
- **FR-5.1 SSRF-Safe Web Clipper**: Pre-fetch IP checks reject loopback (`127.0.0.1`), private RFC 1918 subnets, and metadata endpoints. HTML content is sanitized of all script and iframe elements.
- **FR-5.2 Markdown Export**: Portable export of any note to Markdown with YAML frontmatter containing title, notebook, tags, and revision number.
