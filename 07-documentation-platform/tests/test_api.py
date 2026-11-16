import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from main import app

TEST_DB_FILE = "./test_docs_api.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass


def test_full_docs_platform_api_lifecycle(client):
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["service"] == "07-documentation-platform"

    # 2. Create Documentation Project
    proj_res = client.post("/api/v1/projects", json={
        "name": "Acme Cloud Platform",
        "slug": "acme-cloud",
        "description": "Developer platform and distributed runtime docs."
    })
    assert proj_res.status_code == 201
    proj_data = proj_res.json()
    proj_id = proj_data["id"]
    assert proj_data["slug"] == "acme-cloud"

    # 3. List Versions (v1.0.0 auto-created)
    v_res = client.get(f"/api/v1/projects/{proj_id}/versions")
    assert v_res.status_code == 200
    versions = v_res.json()
    assert len(versions) == 1
    v1_id = versions[0]["id"]
    assert versions[0]["version_string"] == "v1.0.0"

    # 4. Add v2.0.0 Version (as default)
    v2_res = client.post(f"/api/v1/projects/{proj_id}/versions", json={
        "version_string": "v2.0.0",
        "is_default": True
    })
    assert v2_res.status_code == 201
    v2_data = v2_res.json()
    v2_id = v2_data["id"]

    # 5. Add Pages to v2.0.0
    page1_res = client.post(f"/api/v1/projects/{proj_id}/pages", json={
        "version_id": v2_id,
        "slug": "index",
        "title": "Welcome to Acme Cloud",
        "raw_content": """---
title: Welcome to Acme Cloud
---
## Overview
Acme Cloud powers mission-critical deployments.
Check out [Architecture Guide](architecture) before configuring.

:::tip Deployment Tip
Always configure health check endpoints.
:::
"""
    })
    assert page1_res.status_code == 201
    page1 = page1_res.json()
    assert page1["slug"] == "index"
    assert "doc-callout-tip" in page1["html_content"]

    page2_res = client.post(f"/api/v1/projects/{proj_id}/pages", json={
        "version_id": v2_id,
        "slug": "architecture",
        "title": "Architecture Guide",
        "raw_content": """---
title: Architecture Guide
---
## Distributed Architecture
Overview of clusters and microservices.
"""
    })
    assert page2_res.status_code == 201

    # 6. Upload OpenAPI 3.0 specification
    spec_res = client.post(f"/api/v1/projects/{proj_id}/api-specs", json={
        "version_id": v2_id,
        "title": "Acme Core API v2",
        "raw_spec": """
openapi: "3.0.0"
info:
  title: "Acme Cloud API"
  version: "2.0.0"
paths:
  /services:
    get:
      summary: "List deployed services"
      tags:
        - Services
      responses:
        "200":
          description: "List of services"
"""
    })
    assert spec_res.status_code == 201
    spec_data = spec_res.json()
    assert len(spec_data["parsed_endpoints_json"]) == 1

    # 7. Trigger Static Site Generator Build
    build_res = client.post(f"/api/v1/projects/{proj_id}/builds", json={
        "trigger_type": "MANUAL"
    })
    assert build_res.status_code == 201
    build_data = build_res.json()
    assert build_data["status"] == "SUCCESS"
    assert build_data["broken_links_count"] == 0
    assert build_data["total_pages"] >= 3  # index, architecture, api-reference

    # 8. Test Search Query Endpoint
    search_res = client.get(f"/api/v1/projects/{proj_id}/search?q=architecture")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total_results"] >= 1
    assert search_data["results"][0]["slug"] == "architecture"
