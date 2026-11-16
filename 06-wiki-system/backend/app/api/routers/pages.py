from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Space, Page, PageRevision, PageBacklink, SpaceMember, User
from app.schemas.page import PageCreate, PageUpdate, PageResponse, PageRevisionResponse, DiffResponse, BacklinkItem
from app.api.deps import get_current_user, get_optional_user
from app.services.permissions import PermissionEvaluator
from app.services.backlinks import BacklinkExtractor
from app.services.diff_engine import DiffEngine

router = APIRouter(tags=["Pages"])

@router.get("/spaces/{space_slug}/pages/{slug}", response_model=PageResponse)
def get_page(
    space_slug: str,
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    space = db.query(Space).filter(Space.slug == space_slug.lower()).first()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    page = db.query(Page).filter(
        Page.space_id == space.id,
        Page.slug == slug.lower()
    ).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    # Inbound backlinks
    backlinks = db.query(PageBacklink).filter(
        (PageBacklink.target_page_id == page.id) | (PageBacklink.target_slug == page.slug)
    ).all()

    inbound = []
    for bl in backlinks:
        if bl.source_page:
            inbound.append(BacklinkItem(
                source_page_id=bl.source_page_id,
                source_title=bl.source_page.title,
                source_slug=bl.source_page.slug,
                link_label=bl.link_label
            ))

    res = PageResponse.model_validate(page)
    res.inbound_backlinks = inbound
    return res

@router.post("/spaces/{space_slug}/pages", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
def create_page(
    space_slug: str,
    dto: PageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    space = db.query(Space).filter(Space.slug == space_slug.lower()).first()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    existing = db.query(Page).filter(
        Page.space_id == space.id,
        Page.slug == dto.slug.lower()
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A page with this slug already exists in this space")

    # Check permission
    member = db.query(SpaceMember).filter(SpaceMember.space_id == space.id, SpaceMember.user_id == current_user.id).first()
    can_write = PermissionEvaluator.can(
        action='write',
        user_id=current_user.id,
        user_is_system_admin=bool(current_user.role == "ADMIN"),
        space_is_public=space.is_public,
        space_member_role=member.role if member else None,
    )
    if not can_write:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied to create pages in this space")

    page = Page(
        space_id=space.id,
        parent_id=dto.parent_id,
        title=dto.title,
        slug=dto.slug.lower(),
        content=dto.content,
        status="PUBLISHED",
        current_revision=1,
        author_id=current_user.id,
    )
    db.add(page)
    db.commit()
    db.refresh(page)

    # Initial revision
    revision = PageRevision(
        page_id=page.id,
        revision_number=1,
        title=page.title,
        content=page.content,
        change_summary=dto.change_summary or "Initial page creation",
        author_id=current_user.id,
    )
    db.add(revision)

    # Extract and store backlinks
    space_pages = db.query(Page).filter(Page.space_id == space.id).all()
    slug_to_id = {p.slug: p.id for p in space_pages}
    backlink_records = BacklinkExtractor.reconcile_backlinks(page.id, page.content, slug_to_id)
    for bl in backlink_records:
        db.add(PageBacklink(
            source_page_id=bl['source_page_id'],
            target_slug=bl['target_slug'],
            target_page_id=bl['target_page_id'],
            link_label=bl['link_label'],
        ))

    db.commit()
    db.refresh(page)
    return page

@router.put("/spaces/{space_slug}/pages/{slug}", response_model=PageResponse)
def update_page(
    space_slug: str,
    slug: str,
    dto: PageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    space = db.query(Space).filter(Space.slug == space_slug.lower()).first()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    page = db.query(Page).filter(
        Page.space_id == space.id,
        Page.slug == slug.lower()
    ).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    # Increment revision
    new_rev_number = page.current_revision + 1
    page.title = dto.title if dto.title is not None else page.title
    page.content = dto.content if dto.content is not None else page.content
    page.parent_id = dto.parent_id if dto.parent_id is not None else page.parent_id
    page.current_revision = new_rev_number

    # Save revision
    revision = PageRevision(
        page_id=page.id,
        revision_number=new_rev_number,
        title=page.title,
        content=page.content,
        change_summary=dto.change_summary or f"Revision #{new_rev_number}",
        author_id=current_user.id,
    )
    db.add(revision)

    # Re-extract backlinks
    db.query(PageBacklink).filter(PageBacklink.source_page_id == page.id).delete()
    space_pages = db.query(Page).filter(Page.space_id == space.id).all()
    slug_to_id = {p.slug: p.id for p in space_pages}
    backlink_records = BacklinkExtractor.reconcile_backlinks(page.id, page.content, slug_to_id)
    for bl in backlink_records:
        db.add(PageBacklink(
            source_page_id=bl['source_page_id'],
            target_slug=bl['target_slug'],
            target_page_id=bl['target_page_id'],
            link_label=bl['link_label'],
        ))

    db.commit()
    db.refresh(page)
    return page

@router.get("/pages/{page_id}/revisions", response_model=List[PageRevisionResponse])
def get_page_revisions(page_id: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    return db.query(PageRevision).filter(
        PageRevision.page_id == page_id
    ).order_by(PageRevision.revision_number.desc()).all()

@router.get("/pages/{page_id}/diff", response_model=DiffResponse)
def get_page_diff(
    page_id: str,
    rev_from: int = Query(..., description="Starting revision number"),
    rev_to: int = Query(..., description="Target revision number"),
    db: Session = Depends(get_db)
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    r1 = db.query(PageRevision).filter(PageRevision.page_id == page_id, PageRevision.revision_number == rev_from).first()
    r2 = db.query(PageRevision).filter(PageRevision.page_id == page_id, PageRevision.revision_number == rev_to).first()

    if not r1 or not r2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both revision numbers not found")

    diff_data = DiffEngine.compute_line_diff(r1.content, r2.content)
    return diff_data

@router.post("/pages/{page_id}/rollback", response_model=PageResponse)
def rollback_page(
    page_id: str,
    target_revision: int = Query(..., description="Revision number to restore"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    hist_rev = db.query(PageRevision).filter(
        PageRevision.page_id == page_id,
        PageRevision.revision_number == target_revision
    ).first()
    if not hist_rev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target revision not found")

    rollback_data = DiffEngine.prepare_rollback_content(hist_rev.content, target_revision)

    new_rev_number = page.current_revision + 1
    page.content = rollback_data['content']
    page.current_revision = new_rev_number

    new_revision = PageRevision(
        page_id=page.id,
        revision_number=new_rev_number,
        title=page.title,
        content=page.content,
        change_summary=rollback_data['change_summary'],
        author_id=current_user.id,
    )
    db.add(new_revision)
    db.commit()
    db.refresh(page)
    return page
