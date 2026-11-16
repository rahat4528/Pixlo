import pytest
from generator.search_indexer import SearchIndexer, tokenize


def test_tokenize():
    tokens = tokenize("How to Configure PostgreSQL and Redis in Pixlo!")
    assert "configure" in tokens
    assert "postgresql" in tokens
    assert "redis" in tokens
    assert "pixlo" in tokens
    assert "and" not in tokens  # Stop word
    assert "in" not in tokens   # Stop word


def test_search_scoring_and_ranking():
    indexer = SearchIndexer()

    # Doc 1: "Authentication" in title
    indexer.add_document(
        doc_id="doc-1",
        title="Authentication and JWT Security",
        slug="auth",
        body="Learn how user sessions work.",
        headings=["Session Tokens", "Key Rotation"]
    )

    # Doc 2: "Authentication" only in body text
    indexer.add_document(
        doc_id="doc-2",
        title="Database Models",
        slug="models",
        body="The user model includes authentication password hash fields.",
        headings=["Schema", "Migrations"]
    )

    results = indexer.search("authentication")
    assert len(results) == 2
    # Title match should score significantly higher than body match
    assert results[0]["id"] == "doc-1"
    assert results[0]["score"] > results[1]["score"]
    assert "<mark>auth" in results[0]["snippet"].lower() or "<mark>authentication" in results[0]["snippet"].lower()


def test_search_index_export():
    indexer = SearchIndexer()
    indexer.add_document("doc-1", "Intro", "intro", "Welcome to Pixlo Docs")
    exported = indexer.export_index()
    assert "documents" in exported
    assert "inverted_index" in exported
    assert "doc-1" in exported["documents"]
