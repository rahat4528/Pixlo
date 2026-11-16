# Documentation Platform

Developer documentation engine with custom Python static site generator (SSG), multi-version support, YAML frontmatter, custom admonitions, OpenAPI 3.x parser with runnable cURL snippets, broken link and dead anchor auditing, and inverted full-text search indexing.

## Features

- **Custom Static Site Generator**: Pure Python SSG compiling Markdown content, Jinja2 templates, and OpenAPI schemas to static HTML.
- **Multi-Version Switching**: Manage parallel releases (`v1.0.0`, `v2.0.0`, `next`), version aliases (`latest`), and outdated version warning banners.
- **Rich Documentation Styling**: Built-in support for YAML frontmatter, custom callouts (`:::note`, `:::tip`, `:::warning`, `:::danger`), code blocks, and nested TOC trees.
- **OpenAPI 3.x Ingestion**: Ingests JSON/YAML API schemas, organizes operations by tag, and produces runnable cURL commands.
- **Broken Link & Dead Anchor Auditor**: Pre-build graph validation ensuring all internal hyperlinks and heading anchors resolve cleanly.
- **Inverted Full-Text Search**: Weighted token indexer (Title: 5.0, Headings: 3.0, Body: 1.0) with match highlighting.
- **Developer Portal UI**: Next.js 14 frontend with keyboard search modal (`⌘K`), version switcher, reader layout, API reference viewer, and build dashboard.

---

## Deployment & Hosting Status

| Component | Platform | Status | URL |
| :--- | :--- | :--- | :--- |
| **Project Code** | GitHub | **Available** | [GitHub Repository](https://github.com/rahat4528/Pixlo/tree/main/07-documentation-platform) |
| **Frontend** | Vercel | **Not Deployed** | Local build verified on port 3007 |
| **Backend API** | Render | **Not Deployed** | Local FastAPI verified on port 4007 |
| **Database** | Docker (PostgreSQL 16) | **Local Container** | Port 5437 (`pixlo_docs_db`) |
| **Cache/Queue** | Docker (Redis 7) | **Local Container** | Port 6387 |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
- **Backend API**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2.
- **Static Site Generator**: Python 3.13, Jinja2, Markdown, PyYAML.
- **Database**: PostgreSQL 16 (`pixlo_docs_db`).
- **Cache**: Redis 7.
- **Testing**: Pytest, HTTPX, SQLite test runner.

---

## Directory Structure

```
07-documentation-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── api_specs.py
│   │   │   ├── builds.py
│   │   │   ├── pages.py
│   │   │   ├── projects.py
│   │   │   ├── search.py
│   │   │   └── versions.py
│   │   ├── core/config.py
│   │   ├── db/session.py
│   │   ├── models/doc_models.py
│   │   └── schemas/doc_schemas.py
│   ├── main.py
│   └── requirements.txt
├── database/
│   └── schema.sql
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── completion-report.md
│   └── requirements.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── builds/
│   │   │   ├── docs/[project]/[version]/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── Navigation.tsx
│   │       └── SearchModal.tsx
│   ├── package.json
│   └── tailwind.config.ts
├── generator/
│   ├── builder.py
│   ├── link_validator.py
│   ├── markdown_parser.py
│   ├── openapi_parser.py
│   ├── search_indexer.py
│   └── version_manager.py
├── templates/
│   ├── api_reference.html
│   ├── base.html
│   └── page.html
├── tests/
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_builder.py
│   ├── test_link_validator.py
│   ├── test_markdown_parser.py
│   ├── test_openapi_parser.py
│   ├── test_search_indexer.py
│   └── test_version_manager.py
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Run Backend & Static Site Generator
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --port 4007 --reload
```

### 3. Run Frontend Portal
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3007
```

### 4. Run Test Suite
```bash
python -m pytest tests/ -v
```
