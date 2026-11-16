-- =====================================================================
-- Pixlo CMS Platform — PostgreSQL Database Schema
-- Database: pixlo_cms_db
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Types (Schema Definitions)
CREATE TABLE IF NOT EXISTS cms_content_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    singular_name VARCHAR(120) NOT NULL,
    plural_name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    is_single BOOLEAN DEFAULT FALSE,
    schema_definition JSONB NOT NULL DEFAULT '{"fields": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_content_types_slug ON cms_content_types(slug);

-- Dynamic Content Entries
CREATE TABLE IF NOT EXISTS cms_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type_id UUID NOT NULL REFERENCES cms_content_types(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    locale VARCHAR(10) DEFAULT 'en',
    version INT DEFAULT 1,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_entries_type ON cms_entries(content_type_id);
CREATE INDEX IF NOT EXISTS idx_cms_entries_status ON cms_entries(status);
CREATE INDEX IF NOT EXISTS idx_cms_entries_locale ON cms_entries(locale);
CREATE INDEX IF NOT EXISTS idx_cms_entries_data ON cms_entries USING GIN(data);

-- Media Assets
CREATE TABLE IF NOT EXISTS cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    width INT,
    height INT,
    formats_json JSONB DEFAULT '{}'::jsonb,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_media_hash ON cms_media(file_hash);

-- Plugins & Extension Lifecycle
CREATE TABLE IF NOT EXISTS cms_plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    config_json JSONB DEFAULT '{}'::jsonb,
    hooks_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_plugins_slug ON cms_plugins(slug);

-- API Tokens (Gated access for headless consumers)
CREATE TABLE IF NOT EXISTS cms_api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    token_type VARCHAR(50) DEFAULT 'READ_ONLY',
    permissions_json JSONB DEFAULT '{"scopes": ["content:read"]}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_api_tokens_hash ON cms_api_tokens(token_hash);
