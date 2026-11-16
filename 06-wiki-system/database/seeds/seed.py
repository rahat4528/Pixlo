import os
import sys

# Ensure backend app is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend')))

from app.database import Base, engine, SessionLocal
from app.models import User, Space, SpaceMember, Page, PageRevision, PageBacklink, PageApprovalRequest
from app.core.security import hash_password

def seed_database():
    print("Seeding Pixlo Wiki System database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing
        db.query(PageApprovalRequest).delete()
        db.query(PageBacklink).delete()
        db.query(PageRevision).delete()
        db.query(Page).delete()
        db.query(SpaceMember).delete()
        db.query(Space).delete()
        db.query(User).delete()
        db.commit()

        # 1. Users
        password_hash = hash_password("PixloWiki2026!")
        admin_user = User(
            email="admin@pixlowiki.local",
            password_hash=password_hash,
            name="Platform Admin",
            role="ADMIN",
        )
        editor_user = User(
            email="editor@pixlowiki.local",
            password_hash=password_hash,
            name="Elena Architect",
            role="USER",
        )
        contrib_user = User(
            email="writer@pixlowiki.local",
            password_hash=password_hash,
            name="David Contributor",
            role="USER",
        )
        db.add_all([admin_user, editor_user, contrib_user])
        db.commit()

        # 2. Spaces
        eng_space = Space(
            name="Engineering Architecture",
            slug="engineering",
            description="Core software architecture guidelines, API standards, and database isolation blueprints.",
            icon="Cpu",
            is_public=True,
            created_by_id=admin_user.id,
        )
        prod_space = Space(
            name="Product & Delivery",
            slug="product",
            description="Product roadmaps, feature specifications, and release governance.",
            icon="Layers",
            is_public=True,
            created_by_id=editor_user.id,
        )
        db.add_all([eng_space, prod_space])
        db.commit()

        # Memberships
        db.add(SpaceMember(space_id=eng_space.id, user_id=admin_user.id, role="ADMIN"))
        db.add(SpaceMember(space_id=eng_space.id, user_id=editor_user.id, role="EDITOR"))
        db.add(SpaceMember(space_id=eng_space.id, user_id=contrib_user.id, role="CONTRIBUTOR"))
        db.commit()

        # 3. Pages (Hierarchical)
        root_page = Page(
            space_id=eng_space.id,
            parent_id=None,
            title="Engineering Standards & Handbook",
            slug="engineering-handbook",
            content="""# Engineering Standards Handbook

Welcome to the internal engineering handbook.

All engineers must adhere to our [[distributed-systems|Distributed Systems Standards]] and review our [[database-migrations|Database Isolation Principles]].

## Table of Contents
- [[distributed-systems|Distributed Systems Standards]]
- [[database-migrations|Database Isolation Principles]]
""",
            status="PUBLISHED",
            current_revision=1,
            author_id=editor_user.id,
        )
        db.add(root_page)
        db.commit()

        # Child Page 1
        child_page_1 = Page(
            space_id=eng_space.id,
            parent_id=root_page.id,
            title="Distributed Systems Standards",
            slug="distributed-systems",
            content="""# Distributed Systems Standards

In distributed architectures, services communicate over asynchronous queues and enforce idempotent processing.

Refer back to [[engineering-handbook|Engineering Handbook]] for overall governance.
""",
            status="PUBLISHED",
            current_revision=1,
            author_id=editor_user.id,
        )

        # Child Page 2
        child_page_2 = Page(
            space_id=eng_space.id,
            parent_id=root_page.id,
            title="Database Isolation Principles",
            slug="database-migrations",
            content="""# Database Isolation Principles

Every standalone application must operate on a dedicated PostgreSQL database schema. No cross-application joins are permitted.

Linked from [[engineering-handbook]].
""",
            status="PUBLISHED",
            current_revision=1,
            author_id=editor_user.id,
        )
        db.add_all([child_page_1, child_page_2])
        db.commit()

        # Revisions
        db.add(PageRevision(
            page_id=root_page.id,
            revision_number=1,
            title=root_page.title,
            content=root_page.content,
            change_summary="Initial handbook composition",
            author_id=editor_user.id,
        ))
        db.add(PageRevision(
            page_id=child_page_1.id,
            revision_number=1,
            title=child_page_1.title,
            content=child_page_1.content,
            change_summary="Initial distributed systems standards draft",
            author_id=editor_user.id,
        ))
        db.add(PageRevision(
            page_id=child_page_2.id,
            revision_number=1,
            title=child_page_2.title,
            content=child_page_2.content,
            change_summary="Initial database isolation standards",
            author_id=editor_user.id,
        ))
        db.commit()

        # Backlinks
        db.add(PageBacklink(
            source_page_id=root_page.id,
            target_page_id=child_page_1.id,
            target_slug="distributed-systems",
            link_label="Distributed Systems Standards",
        ))
        db.add(PageBacklink(
            source_page_id=root_page.id,
            target_page_id=child_page_2.id,
            target_slug="database-migrations",
            link_label="Database Isolation Principles",
        ))
        db.add(PageBacklink(
            source_page_id=child_page_1.id,
            target_page_id=root_page.id,
            target_slug="engineering-handbook",
            link_label="Engineering Handbook",
        ))
        db.commit()

        print("Wiki System seeded successfully with spaces, hierarchical pages, revisions, and backlinks!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
