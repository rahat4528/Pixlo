# Pixlo

Pixlo is an enterprise-grade suite of 8 independent, standalone, production-quality applications spanning content management, publishing, culinary communities, news curation, personal knowledge management, newsletter broadcasting, collaborative documentation, and headless digital experience management.

Every application in this repository is completely self-contained with its own frontend, backend, database schema, migration pipeline, authentication and authorization layers, test suites, and Docker infrastructure.

---

## The 8 Standalone Applications

| Folder | Application Name | Core Focus & Architecture | Status |
|---|---|---|---|
| `01-blog-platform-medium-clone` | **Blog Platform (Medium Clone)** | Editorial long-form article publishing platform, multi-author publications, rich typography, personalized feeds, revision history, and author analytics. | Completed |
| `02-recipe-sharing-platform` | **Recipe Sharing Platform** | Culinary social platform featuring exact-arithmetic ingredient scaling, unit dimensions, step checklists, weekly meal planning, and shopping list generators. | Not Started |
| `03-news-aggregator` | **News Aggregator** | Content curation platform featuring feed ingestion, duplicate detection, story clustering, category taxonomies, and SSRF-safe parsers. | Not Started |
| `04-note-taking-app-evernote-clone` | **Note-Taking App (Evernote Clone)** | Personal productivity workspace featuring notebooks, hierarchical tags, optimistic concurrency, conflict resolution, offline synchronization, and search indexing. | Not Started |
| `05-newsletter-platform` | **Newsletter Platform** | Consent-based subscriber broadcasting engine with double opt-in, email template designers, campaign pipelines, unsubscribe compliance, and delivery tracking. | Not Started |
| `06-wiki-system` | **Wiki System** | Team knowledge base with hierarchical spaces, inheritance permissions, bi-directional backlinks, version diffs, and approval workflows. | Not Started |
| `07-documentation-platform` | **Documentation Platform** | Developer documentation engine with custom static site generator, version switcher, OpenAPI 3.x ingestion, link validation, and preview builds. | Not Started |
| `08-cms-platform-wordpress-alternative` | **CMS Platform (WordPress Alternative)** | Metadata-driven headless content management system with schema builder, dynamic REST API generation, media asset library, and plugin lifecycle. | Not Started |

---

## Architectural Principles

1. **Strict Independence**: No application shares a database, runtime backend, or authentication secret with any other application. Each app can be deployed and scaled in total isolation.
2. **Standardized Technology Stacks**: Built with modern TypeScript across full-stack Next.js and NestJS, PostgreSQL relational storage, Redis caching and task orchestration, BullMQ background queues, and S3-compatible asset management.
3. **Enterprise Security**: Argon2/bcrypt password hashing, stateless JWT with refresh token rotation, granular role- and ownership-based access control (RBAC), rate limiting, strict CORS and CSRF policies, and SSRF defenses on all external URL ingestors.
4. **Content Integrity**: All user-generated rich text is stored structurally and sanitized via allowlists before presentation. Data revisions are immutable, and scheduled actions run through idempotent background workers.
5. **Deterministic Verification**: Every application includes comprehensive unit tests, API tests, security verification, and independence checks.

---

## Repository Structure

```
Pixlo/
  ├── README.md
  ├── LICENSE
  ├── .gitignore
  ├── PROGRESS.md
  ├── docs/
  │   ├── repository-overview.md
  │   ├── architecture.md
  │   ├── technology-stack.md
  │   ├── development-guide.md
  │   ├── project-index.md
  │   └── final-delivery-report.md (post Phase 8)
  └── [01..08]-[project-name]/
      ├── frontend/
      ├── backend/
      ├── database/
      ├── tests/
      ├── docs/
      ├── docker-compose.yml
      ├── .env.example
      └── README.md
```

---

## Documentation

- [Repository Overview](file:///c:/project%2003/pixLo%20Content/docs/repository-overview.md)
- [Architecture Blueprint](file:///c:/project%2003/pixLo%20Content/docs/architecture.md)
- [Technology Stack Matrix](file:///c:/project%2003/pixLo%20Content/docs/technology-stack.md)
- [Development & Verification Guide](file:///c:/project%2003/pixLo%20Content/docs/development-guide.md)
- [Project Index](file:///c:/project%2003/pixLo%20Content/docs/project-index.md)
- [Progress Tracker](file:///c:/project%2003/pixLo%20Content/PROGRESS.md)

---

## License

MIT License. See [LICENSE](file:///c:/project%2003/pixLo%20Content/LICENSE) for complete terms.
