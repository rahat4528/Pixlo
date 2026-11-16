-- =====================================================================
-- Pixlo Documentation Platform — PostgreSQL Database Schema
-- Database: pixlo_docs_db
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE IF NOT EXISTS doc_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    repository_url VARCHAR(500),
    default_version VARCHAR(50) DEFAULT 'latest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_projects_slug ON doc_projects(slug);

-- Versions Table
CREATE TABLE IF NOT EXISTS doc_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES doc_projects(id) ON DELETE CASCADE,
    version_string VARCHAR(50) NOT NULL,
    is_prerelease BOOLEAN DEFAULT FALSE,
    is_deprecated BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_version UNIQUE (project_id, version_string)
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_project ON doc_versions(project_id);

-- Documentation Pages Table
CREATE TABLE IF NOT EXISTS doc_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES doc_projects(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES doc_versions(id) ON DELETE CASCADE,
    slug VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    title VARCHAR(255) NOT NULL,
    raw_content TEXT NOT NULL,
    html_content TEXT,
    order_index INT DEFAULT 0,
    parent_id UUID REFERENCES doc_pages(id) ON DELETE SET NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_version_page_slug UNIQUE (version_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_doc_pages_version_slug ON doc_pages(version_id, slug);
CREATE INDEX IF NOT EXISTS idx_doc_pages_parent ON doc_pages(parent_id);

-- OpenAPI Specifications Table
CREATE TABLE IF NOT EXISTS doc_api_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES doc_projects(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES doc_versions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    spec_type VARCHAR(20) DEFAULT 'OPENAPI_3',
    raw_spec TEXT NOT NULL,
    parsed_endpoints_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_api_specs_project_version ON doc_api_specs(project_id, version_id);

-- Build Runs & Previews Table
CREATE TABLE IF NOT EXISTS doc_build_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES doc_projects(id) ON DELETE CASCADE,
    version_id UUID REFERENCES doc_versions(id) ON DELETE SET NULL,
    trigger_type VARCHAR(50) DEFAULT 'MANUAL',
    status VARCHAR(50) DEFAULT 'PENDING',
    total_pages INT DEFAULT 0,
    broken_links_count INT DEFAULT 0,
    build_duration_ms INT DEFAULT 0,
    log_output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_build_runs_project ON doc_build_runs(project_id, created_at DESC);
