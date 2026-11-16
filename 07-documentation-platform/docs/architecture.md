# Documentation Platform — System Architecture

## 1. High-Level Architecture

The Documentation Platform is organized into two primary operational modes:
1. **Static Site Generator (SSG) Engine**: Pure Python builder that reads Markdown files, Jinja2 layouts, and OpenAPI specs to emit self-contained static HTML pages into `dist/`.
2. **Dynamic Management & Preview Service**: FastAPI backend (Port 4007) and Next.js portal (Port 3007) providing interactive document browsing, OpenAPI explorer, build monitoring, and link validation telemetry.

```
+-------------------------------------------------------------+
|                      Client / Browser                       |
|          Next.js Developer Portal (Port 3007)               |
+------------------------------+------------------------------+
                               | HTTP / REST API
                               v
+-------------------------------------------------------------+
|                     FastAPI Application                     |
|                         (Port 4007)                         |
|  +--------------------+  +-------------------------------+  |
|  | Routers:           |  | Custom Static Generator:      |  |
|  | - /projects        |  | - Markdown Parser (PyYAML)    |  |
|  | - /versions        |  | - Version Manager (SemVer)    |  |
|  | - /pages           |  | - OpenAPI 3.x Parser (cURL)   |  |
|  | - /api-specs       |  | - Link Validator (Audit Graph)|  |
|  | - /builds          |  | - Search Indexer (Inverted)   |  |
|  | - /search          |  | - Jinja2 Template Renderer    |  |
|  +--------------------+  +-------------------------------+  |
+--------------+------------------------------+---------------+
               |                              |
               v                              v
+-------------------------------+  +--------------------------+
|          PostgreSQL           |  |     Static HTML Output   |
|       (pixlo_docs_db)         |  |   07-doc-platform/dist/  |
|   Projects, Versions, Pages,  |  |   v1.0.0/ v2.0.0/        |
|    Specs, Builds, Previews    |  |   search-index.json      |
+-------------------------------+  +--------------------------+
```

## 2. Component Breakdown

### 2.1 Markdown & Admonitions Engine (`generator/markdown_parser.py`)
- Extracts YAML frontmatter blocks via PyYAML.
- Translates `:::note`, `:::tip`, `:::warning`, `:::danger` container blocks into responsive alert DOM elements.
- Extracts Markdown headings (`h2`-`h4`) and computes a hierarchical table-of-contents tree.

### 2.2 Version Manager (`generator/version_manager.py`)
- Normalizes version strings (`v1.0.0`, `v2.0.0-rc1`, `next`).
- Evaluates version superiority using semantic version tuples.
- Generates outdated alert banner payloads when older versions are requested.

### 2.3 OpenAPI 3.x Parser (`generator/openapi_parser.py`)
- Reads OpenAPI 3.0 / 3.1 specifications in JSON or YAML.
- Groups operations by tags.
- Constructs formatted, copy-ready cURL command snippets.

### 2.4 Link Validator (`generator/link_validator.py`)
- Validates internal document hyperlinks and `#anchor` hash targets across all versions.
- Generates audit reports flagging dead links before publishing.

### 2.5 Inverted Search Indexer (`generator/search_indexer.py`)
- Tokenizes documentation text, filters stop words, and indexes word stems.
- Computes weighted relevance scores (Titles: 5.0, Headings: 3.0, Body: 1.0).
- Produces search query snippets with highlighted `<mark>` keywords.
