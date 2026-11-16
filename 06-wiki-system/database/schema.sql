-- Pixlo Wiki System Schema (PostgreSQL 16)
-- Database: pixlo_wiki_db

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Folder',
    is_public BOOLEAN DEFAULT TRUE,
    created_by_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS space_members (
    id VARCHAR(36) PRIMARY KEY,
    space_id VARCHAR(36) NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER', -- ADMIN, EDITOR, CONTRIBUTOR, VIEWER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_space_member UNIQUE (space_id, user_id)
);

CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(36) PRIMARY KEY,
    space_id VARCHAR(36) NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    parent_id VARCHAR(36) REFERENCES pages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED', -- DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED
    current_revision INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    author_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_space_page_slug UNIQUE (space_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_space_parent ON pages(space_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

CREATE TABLE IF NOT EXISTS page_revisions (
    id VARCHAR(36) PRIMARY KEY,
    page_id VARCHAR(36) NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    change_summary VARCHAR(500),
    author_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_page_revision UNIQUE (page_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_revisions_page ON page_revisions(page_id);

CREATE TABLE IF NOT EXISTS page_backlinks (
    id VARCHAR(36) PRIMARY KEY,
    source_page_id VARCHAR(36) NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    target_page_id VARCHAR(36) REFERENCES pages(id) ON DELETE SET NULL,
    target_slug VARCHAR(255) NOT NULL,
    link_label VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_page_backlink UNIQUE (source_page_id, target_slug)
);

CREATE INDEX IF NOT EXISTS idx_backlinks_target_page ON page_backlinks(target_page_id);
CREATE INDEX IF NOT EXISTS idx_backlinks_target_slug ON page_backlinks(target_slug);

CREATE TABLE IF NOT EXISTS page_permission_overrides (
    id VARCHAR(36) PRIMARY KEY,
    page_id VARCHAR(36) NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER', -- ADMIN, EDITOR, CONTRIBUTOR, VIEWER, NONE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_page_user_override UNIQUE (page_id, user_id)
);

CREATE TABLE IF NOT EXISTS page_approval_requests (
    id VARCHAR(36) PRIMARY KEY,
    page_id VARCHAR(36) NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    revision_id VARCHAR(36) REFERENCES page_revisions(id) ON DELETE CASCADE,
    requester_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON page_approval_requests(status);
