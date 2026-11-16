import os
import pytest
from fastapi.testclient import TestClient

# Use SQLite for tests
os.environ["TESTING"] = "1"
os.environ["TEST_DATABASE_URL"] = "sqlite:///./test_wiki_api.db"

from app.database import Base, engine
from app.main import app

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        if os.path.exists("./test_wiki_api.db"):
            os.remove("./test_wiki_api.db")
    except Exception:
        pass

def test_full_wiki_api_lifecycle(client):
    # 1. Health check
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    # 2. Register user
    reg_res = client.post("/api/auth/register", json={
        "email": "architect@pixlowiki.local",
        "password": "StrongPassword123!",
        "name": "Elena Architect"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create space
    space_res = client.post("/api/spaces", json={
        "name": "Core Engineering",
        "slug": "core-engineering",
        "description": "Foundational architectural guidelines",
        "icon": "Cpu",
        "is_public": True,
    }, headers=headers)
    assert space_res.status_code == 201
    space = space_res.json()
    assert space["slug"] == "core-engineering"

    # 4. Create root page with wiki link to child
    root_page_res = client.post("/api/spaces/core-engineering/pages", json={
        "title": "Architecture Overview",
        "slug": "arch-overview",
        "content": "# Overview\nSee our [[service-catalog|Service Catalog]] for system details.",
        "change_summary": "Initial architecture RFC",
    }, headers=headers)
    assert root_page_res.status_code == 201
    root_page = root_page_res.json()
    assert root_page["current_revision"] == 1

    # 5. Create child page
    child_page_res = client.post("/api/spaces/core-engineering/pages", json={
        "title": "Service Catalog",
        "slug": "service-catalog",
        "parent_id": root_page["id"],
        "content": "# Services\nMicroservices catalog. Linked back to [[arch-overview]].",
        "change_summary": "Initial catalog listing",
    }, headers=headers)
    assert child_page_res.status_code == 201
    child_page = child_page_res.json()

    # 6. Verify backlinks on child page
    get_child = client.get("/api/spaces/core-engineering/pages/service-catalog", headers=headers)
    assert get_child.status_code == 200
    child_data = get_child.json()
    assert len(child_data["inbound_backlinks"]) >= 1
    assert child_data["inbound_backlinks"][0]["source_slug"] == "arch-overview"

    # 7. Update root page (Revision #2)
    update_res = client.put("/api/spaces/core-engineering/pages/arch-overview", json={
        "content": "# Overview V2\nAdded Redis caching layers and [[service-catalog]].",
        "change_summary": "Added caching details",
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["current_revision"] == 2

    # 8. Check revisions list
    rev_res = client.get(f"/api/pages/{root_page['id']}/revisions", headers=headers)
    assert rev_res.status_code == 200
    revs = rev_res.json()
    assert len(revs) == 2

    # 9. Compute diff between revision 1 and revision 2
    diff_res = client.get(f"/api/pages/{root_page['id']}/diff?rev_from=1&rev_to=2", headers=headers)
    assert diff_res.status_code == 200
    diff = diff_res.json()
    assert diff["stats"]["total_changes"] > 0
    assert "Added Redis caching layers" in diff["unified_diff"]

    # 10. Space Tree
    tree_res = client.get("/api/spaces/core-engineering/tree", headers=headers)
    assert tree_res.status_code == 200
    tree = tree_res.json()
    assert len(tree) >= 1
    assert tree[0]["slug"] == "arch-overview"
    assert len(tree[0]["children"]) >= 1
    assert tree[0]["children"][0]["slug"] == "service-catalog"

    # 11. Roll back root page to revision 1
    rollback_res = client.post(f"/api/pages/{root_page['id']}/rollback?target_revision=1", headers=headers)
    assert rollback_res.status_code == 200
    assert rollback_res.json()["current_revision"] == 3
    assert "Overview" in rollback_res.json()["content"]
