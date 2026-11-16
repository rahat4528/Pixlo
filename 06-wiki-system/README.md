# Wiki System

Enterprise knowledge management and collaborative wiki platform with hierarchical spaces, page revisions, diff computation, bidirectional backlinks, role-based access control, editorial review workflows, and content-addressable local asset storage.

## Features

- **Hierarchical Spaces & Trees**: Organize content into root spaces with nested child pages and dynamic tree view.
- **Revision History & Diffs**: Full audit trail of edits with unified line diff calculation (`difflib`) and instant rollback.
- **Bidirectional Backlinks**: Automatic indexing of wiki-style links (`[[slug|label]]`) and markdown hyperlinks.
- **Granular Permissions**: Role-based access control (`ADMIN`, `EDITOR`, `COLLABORATOR`, `VIEWER`) with space inheritance and page-level ACL overrides.
- **Editorial Review Workflow**: Proposal and review queue (`DRAFT` -> `IN_REVIEW` -> `PUBLISHED` / `REJECTED`) for quality control.
- **Asset Storage Engine**: Local SHA-256 content-addressable storage with MIME validation and directory traversal defenses.
- **Modern Web Interface**: Responsive Next.js 14 frontend with Tailwind CSS and tree exploration.

---

## Deployment & Hosting Status

| Component | Platform | Status | URL |
| :--- | :--- | :--- | :--- |
| **Project Code** | GitHub | **Available** | [GitHub Repository](https://github.com/rahat4528/Pixlo/tree/main/06-wiki-system) |
| **Frontend** | Vercel | **Not Deployed** | Local build verified on port 3006 |
| **Backend API** | Render | **Not Deployed** | Local FastAPI verified on port 4006 |
| **Database** | Docker (PostgreSQL 16) | **Local Container** | Port 5436 (`pixlo_wiki_db`) |
| **Cache/Queue** | Docker (Redis 7) | **Local Container** | Port 6386 |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT.
- **Database**: PostgreSQL 16 (`pixlo_wiki_db`).
- **Cache**: Redis 7.
- **Storage Subsystem**: Local content-addressable storage engine (`storage/asset_manager.py`).
- **Testing**: Pytest, HTTPX, SQLite in-memory test runner.

---

## Directory Structure

```
06-wiki-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── approvals.py
│   │   │       ├── auth.py
│   │   │       ├── pages.py
│   │   │       ├── spaces.py
│   │   │       └── storage.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── base.py
│   │   │   ├── page.py
│   │   │   ├── space.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── approval.py
│   │   │   ├── auth.py
│   │   │   ├── page.py
│   │   │   └── space.py
│   │   └── services/
│   │       ├── approvals.py
│   │       ├── backlinks.py
│   │       ├── diff_engine.py
│   │       └── permissions.py
│   ├── main.py
│   └── requirements.txt
├── database/
│   ├── schema.sql
│   └── seeds/
│       └── seed.py
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── completion-report.md
│   └── requirements.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── approvals/
│   │   │   ├── spaces/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       └── Navigation.tsx
│   ├── package.json
│   └── tailwind.config.ts
├── storage/
│   └── asset_manager.py
├── tests/
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_approvals.py
│   ├── test_backlinks.py
│   ├── test_diff_engine.py
│   ├── test_permissions.py
│   └── test_storage.py
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

### 2. Run Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --port 4006 --reload
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3006
```

### 4. Run Test Suite
```bash
cd backend
pytest ../tests -v
```
