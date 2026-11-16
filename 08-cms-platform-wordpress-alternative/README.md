# CMS Platform (WordPress Alternative)

Metadata-driven headless content management system with visual content-type schema builder, automated dynamic REST API generation, sandboxed plugin and lifecycle hooks architecture, centralized media library with responsive image variants, and API token security.

## Features

- **Content-Type Schema Builder**: Create custom dynamic models with string, text, richtext, number, boolean, date, media, and enumeration fields.
- **Dynamic REST API Generation**: Automated CRUD endpoints provisioned instantly for every user-defined content model with filtering (`$eq`, `$gt`, `$contains`), sorting, pagination, and projection.
- **Sandboxed Plugin & Hook Lifecycle**: Dispatches `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete` hooks. Includes built-in SEO slug auto-generation and Webhook dispatching.
- **Media Asset Library**: Local content-addressable SHA-256 storage with MIME verification and automated responsive variant metadata (`thumbnail`, `medium`, `large`).
- **Content Versioning & Draft State**: Multi-locale support, immutable revisions, and Draft vs. Published status transitions.
- **API Token Management**: Salted, cryptographically hashed tokens for secure, scoped headless consumer access.
- **Modern Studio Interface**: High-productivity Next.js 14 Studio with Visual Schema Builder, Dynamic Content Entry Editor, and Media Library.

---

## Deployment & Hosting Status

| Component | Platform | Status | URL |
| :--- | :--- | :--- | :--- |
| **Project Code** | GitHub | **Available** | [GitHub Repository](https://github.com/rahat4528/Pixlo/tree/main/08-cms-platform-wordpress-alternative) |
| **Studio Frontend** | Vercel | **Not Deployed** | Local build verified on port 3008 |
| **Backend API** | Render | **Not Deployed** | Local Express.js verified on port 4008 |
| **Database** | Docker (PostgreSQL 16) | **Local Container** | Port 5438 (`pixlo_cms_db`) |
| **Cache/Queue** | Docker (Redis 7) | **Local Container** | Port 6388 |

---

## Tech Stack

- **Studio Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
- **Backend API**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL 16 (`pixlo_cms_db`).
- **Cache**: Redis 7.
- **Storage**: Local content-addressable storage (`media/uploads`).
- **Testing**: Jest, Supertest, ts-jest.

---

## Directory Structure

```
08-cms-platform-wordpress-alternative/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── dynamic-query.ts
│   │   │   ├── media-manager.ts
│   │   │   ├── plugin-sandbox.ts
│   │   │   └── schema-validator.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   ├── content.routes.ts
│   │   │   ├── media.routes.ts
│   │   │   ├── plugin.routes.ts
│   │   │   ├── schema.routes.ts
│   │   │   └── token.routes.ts
│   │   ├── store/
│   │   │   └── memory-store.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── api.spec.ts
│   │   ├── dynamic-query.spec.ts
│   │   ├── media-manager.spec.ts
│   │   ├── plugin-sandbox.spec.ts
│   │   └── schema-validator.spec.ts
│   ├── package.json
│   └── tsconfig.json
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
│   │   │   ├── content/[contentType]/
│   │   │   ├── media/
│   │   │   ├── plugins/
│   │   │   ├── schemas/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       └── Navigation.tsx
│   ├── package.json
│   └── tailwind.config.ts
├── media/
│   ├── uploads/
│   └── .gitignore
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

### 2. Run Backend API
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:4008
```

### 3. Run Studio Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3008
```

### 4. Run Test Suite
```bash
cd backend
npm test
```
