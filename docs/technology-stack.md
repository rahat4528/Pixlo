# Pixlo Technology Stack Matrix

This document provides a consolidated breakdown of the technological choices across all eight applications in Pixlo.

## Core Stack Standards

- **Language Runtime**: TypeScript 5.x on Node.js (v20+ / v22+ LTS). Strict mode enabled across all frontend and backend codebases.
- **Frontend Framework**: Next.js (App Router & Pages Router selected per application requirements) and React 18/19.
- **Styling & UI Kit**: Tailwind CSS and accessible component architectures (Radix UI / shadcn/ui patterns, Lucide icons).
- **Backend Architecture**: NestJS modular service architecture, REST APIs documented with OpenAPI / Swagger specifications.
- **Persistence Layer**: PostgreSQL 16+ managed via Prisma ORM for type-safe schema definitions and predictable migration lifecycles.
- **Caching & Queuing**: Redis 7+ paired with BullMQ for reliable, idempotent background job execution.
- **Asset Storage**: S3-compatible object storage (MinIO for local development and integration testing).
- **Testing Suites**: Jest and Supertest for unit, integration, and security testing; Playwright for end-to-end user workflows.

## Technology Breakdown by Project

| Application | Frontend | Backend | Persistence & Cache | Key Libraries & Engines |
|---|---|---|---|---|
| `01-blog-platform-medium-clone` | Next.js, Tailwind CSS | NestJS, TypeScript | PostgreSQL (`pixlo_blog_db`), Redis | Tiptap Editor, BullMQ, DOMPurify, S3 Client |
| `02-recipe-sharing-platform` | Next.js, Tailwind CSS | NestJS, TypeScript | PostgreSQL (`pixlo_recipes_db`), Redis | Rational arithmetic engine, Recharts, Wake Lock API |
| `03-news-aggregator` | Next.js, Tailwind CSS | NestJS, Worker Service | PostgreSQL (`pixlo_news_db`), Redis | fast-xml-parser, SSRF Guard, BullMQ, Cheerio |
| `04-note-taking-app-evernote-clone` | Next.js, Tailwind CSS | NestJS, TypeScript | PostgreSQL (`pixlo_notes_db`), Redis | BlockNote / Tiptap, IndexedDB, Service Worker |
| `05-newsletter-platform` | Next.js, Tailwind CSS | NestJS, BullMQ Workers | PostgreSQL (`pixlo_newsletter_db`), Redis | Tiptap, Email Adapters, Mailpit sink, Cryptographic token generator |
| `06-wiki-system` | Next.js, Tailwind CSS | NestJS, TypeScript | PostgreSQL (`pixlo_wiki_db`), Redis | Markdown/MDX parser, Diff engine, Tree hierarchy |
| `07-documentation-platform` | Next.js, Tailwind CSS | NestJS, Generator Service | PostgreSQL (`pixlo_docs_db`), Redis | Unified / Remark / Rehype, PrismJS syntax highlighter |
| `08-cms-platform-wordpress-alternative` | Next.js, Tailwind CSS | NestJS, TypeScript | PostgreSQL (`pixlo_cms_db`), Redis | JSONB schema validator, Dynamic REST router, Plugin Hook engine |
