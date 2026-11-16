from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Space, SpaceMember, Page, User
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceResponse, SpaceMemberAdd
from app.schemas.page import PageTreeItem
from app.api.deps import get_current_user, get_optional_user
from app.services.permissions import PermissionEvaluator

router = APIRouter(prefix="/spaces", tags=["Spaces"])

@router.get("", response_model=List[SpaceResponse])
def list_spaces(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    if current_user and current_user.role == "ADMIN":
        return db.query(Space).all()

    # Public spaces + spaces where user is member
    query = db.query(Space)
    if current_user:
        query = query.outerjoin(SpaceMember).filter(
            (Space.is_public == True) | (SpaceMember.user_id == current_user.id)
        ).distinct()
    else:
        query = query.filter(Space.is_public == True)

    return query.order_by(Space.created_at.desc()).all()

@router.post("", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
def create_space(
    dto: SpaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Space).filter(Space.slug == dto.slug.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A space with this slug already exists"
        )

    space = Space(
        name=dto.name,
        slug=dto.slug.lower(),
        description=dto.description,
        icon=dto.icon or "Folder",
        is_public=dto.is_public if dto.is_public is not None else True,
        created_by_id=current_user.id,
    )
    db.add(space)
    db.commit()
    db.refresh(space)

    # Assign creator as ADMIN
    member = SpaceMember(space_id=space.id, user_id=current_user.id, role="ADMIN")
    db.add(member)
    db.commit()

    return space

@router.get("/{slug}", response_model=SpaceResponse)
def get_space(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    space = db.query(Space).filter(Space.slug == slug.lower()).first()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    member_role = None
    if current_user:
        member = db.query(SpaceMember).filter(
            SpaceMember.space_id == space.id,
            SpaceMember.user_id == current_user.id
        ).first()
        member_role = member.role if member else None

    can_read = PermissionEvaluator.can(
        action='read',
        user_id=current_user.id if current_user else None,
        user_is_system_admin=bool(current_user and current_user.role == "ADMIN"),
        space_is_public=space.is_public,
        space_member_role=member_role,
    )
    if not can_read:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to private space")

    return space

@router.get("/{slug}/tree", response_model=List[PageTreeItem])
def get_space_tree(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    space = db.query(Space).filter(Space.slug == slug.lower()).first()
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")

    all_pages = db.query(Page).filter(
        Page.space_id == space.id,
        Page.status != "ARCHIVED"
    ).order_by(Page.sort_order.asc(), Page.created_at.asc()).all()

    # Build tree
    pages_by_id = {p.id: p for p in all_pages}
    children_map = {}
    root_pages = []

    for p in all_pages:
        children_map[p.id] = []

    for p in all_pages:
        if p.parent_id and p.parent_id in children_map:
            children_map[p.parent_id].append(p)
        else:
            root_pages.append(p)

    def build_node(page: Page) -> PageTreeItem:
        return PageTreeItem(
            id=page.id,
            title=page.title,
            slug=page.slug,
            parent_id=page.parent_id,
            sort_order=page.sort_order,
            children=[build_node(child) for child in children_map.get(page.id, [])]
        )

    return [build_node(rp) for rp in root_pages]
