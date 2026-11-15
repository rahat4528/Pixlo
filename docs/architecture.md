# Pixlo Architecture Blueprint

This document details the cross-cutting architectural principles, isolation barriers, security controls, and design patterns followed across the Pixlo repository.

## 1. Domain Isolation & Non-Shared Boundaries

Each application in Pixlo operates within strict architectural isolation:
- **No Shared Databases**: Every project defines and connects exclusively to its own dedicated PostgreSQL database.
- **No Shared Processes**: Applications run in their own Node.js runtime environments with independent port allocations.
- **No Shared Authentication State**: JWT keys, session configurations, and user identity tables are segregated within each application's domain.
- **No Inter-Service Coupling**: No application assumes or requires that any other application is running.

## 2. Standard Application Layout

```
NN-project-name/
  ├── frontend/              # User-facing Next.js / React application
  │   ├── src/
  │   ├── package.json
  │   └── tsconfig.json
  ├── backend/               # Domain API service (NestJS / Express)
  │   ├── src/
  │   ├── package.json
  │   └── tsconfig.json
  ├── database/              # Schema, migrations, and seed scripts
  │   ├── prisma/ or migrations/
  │   └── seeds/
  ├── tests/                 # Unit, integration, security, and E2E suites
  ├── docs/                  # Domain documentation
  │   ├── requirements.md
  │   ├── architecture.md
  │   ├── api.md
  │   └── completion-report.md
  ├── docker-compose.yml     # Self-contained service stack
  ├── .env.example
  └── README.md
```

## 3. Database Matrix

| Application | Database Name | Default Port | Cache / Queue Port |
|---|---|---|---|
| `01-blog-platform-medium-clone` | `pixlo_blog_db` | `5431` | `6381` |
| `02-recipe-sharing-platform` | `pixlo_recipes_db` | `5432` | `6382` |
| `03-news-aggregator` | `pixlo_news_db` | `5433` | `6383` |
| `04-note-taking-app-evernote-clone` | `pixlo_notes_db` | `5434` | `6384` |
| `05-newsletter-platform` | `pixlo_newsletter_db` | `5435` | `6385` |
| `06-wiki-system` | `pixlo_wiki_db` | `5436` | `6386` |
| `07-documentation-platform` | `pixlo_docs_db` | `5437` | `6387` |
| `08-cms-platform-wordpress-alternative` | `pixlo_cms_db` | `5438` | `6388` |

## 4. Security Architecture

1. **Authentication & Identity**:
   - Argon2 or bcrypt password hashing with unique salts.
   - Dual-token JWT architecture (access tokens with short TTLs and securely stored refresh tokens).
   - Role-Based Access Control (RBAC) enforced at controller and query levels.

2. **Input Sanitization & Injection Defense**:
   - Class-validator and Zod schemas validating all incoming request payloads.
   - Parameterized SQL / ORM abstractions guarding against SQL injection.
   - Strict DOMPurify / sanitize-html allowlists stripping unauthorized markup and script execution.

3. **Network Protection (SSRF Defenses)**:
   - All external URL fetching modules (RSS parsers, web clippers, webhook dispatchers) implement IP blocklists barring `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, and localhost loops.
   - Strict redirect limits, byte limits, and DNS resolution timeouts.
