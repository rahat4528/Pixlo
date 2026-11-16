from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="USER")  # ADMIN, USER
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    created_spaces = relationship("Space", back_populates="creator")
    memberships = relationship("SpaceMember", back_populates="user", cascade="all, delete-orphan")
    pages = relationship("Page", back_populates="author")
    revisions = relationship("PageRevision", back_populates="author")


class Space(Base):
    __tablename__ = "spaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Folder")
    is_public = Column(Boolean, default=True)
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", back_populates="created_spaces")
    members = relationship("SpaceMember", back_populates="space", cascade="all, delete-orphan")
    pages = relationship("Page", back_populates="space", cascade="all, delete-orphan")


class SpaceMember(Base):
    __tablename__ = "space_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, default="VIEWER")  # ADMIN, EDITOR, CONTRIBUTOR, VIEWER
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    space = relationship("Space", back_populates="members")
    user = relationship("User", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("space_id", "user_id", name="uq_space_member"),
    )


class Page(Base):
    __tablename__ = "pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(String(36), ForeignKey("pages.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="PUBLISHED")  # DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED
    current_revision = Column(Integer, default=1, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    space = relationship("Space", back_populates="pages")
    author = relationship("User", back_populates="pages")
    parent = relationship("Page", remote_side=[id], back_populates="children")
    children = relationship("Page", back_populates="parent")
    revisions = relationship("PageRevision", back_populates="page", cascade="all, delete-orphan", order_by="PageRevision.revision_number.desc()")
    outbound_links = relationship("PageBacklink", foreign_keys="PageBacklink.source_page_id", back_populates="source_page", cascade="all, delete-orphan")
    inbound_links = relationship("PageBacklink", foreign_keys="PageBacklink.target_page_id", back_populates="target_page")
    permission_overrides = relationship("PagePermissionOverride", back_populates="page", cascade="all, delete-orphan")
    approval_requests = relationship("PageApprovalRequest", back_populates="page", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("space_id", "slug", name="uq_space_page_slug"),
        Index("idx_pages_space_parent", "space_id", "parent_id"),
        Index("idx_pages_status", "status"),
    )


class PageRevision(Base):
    __tablename__ = "page_revisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    page_id = Column(String(36), ForeignKey("pages.id", ondelete="CASCADE"), nullable=False)
    revision_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(String(500), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    page = relationship("Page", back_populates="revisions")
    author = relationship("User", back_populates="revisions")

    __table_args__ = (
        UniqueConstraint("page_id", "revision_number", name="uq_page_revision"),
        Index("idx_revisions_page", "page_id"),
    )


class PageBacklink(Base):
    __tablename__ = "page_backlinks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_page_id = Column(String(36), ForeignKey("pages.id", ondelete="CASCADE"), nullable=False)
    target_page_id = Column(String(36), ForeignKey("pages.id", ondelete="SET NULL"), nullable=True)
    target_slug = Column(String(255), nullable=False)
    link_label = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    source_page = relationship("Page", foreign_keys=[source_page_id], back_populates="outbound_links")
    target_page = relationship("Page", foreign_keys=[target_page_id], back_populates="inbound_links")

    __table_args__ = (
        UniqueConstraint("source_page_id", "target_slug", name="uq_page_backlink"),
        Index("idx_backlinks_target_page", "target_page_id"),
        Index("idx_backlinks_target_slug", "target_slug"),
    )


class PagePermissionOverride(Base):
    __tablename__ = "page_permission_overrides"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    page_id = Column(String(36), ForeignKey("pages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    role = Column(String(50), nullable=False, default="VIEWER")  # ADMIN, EDITOR, CONTRIBUTOR, VIEWER, NONE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    page = relationship("Page", back_populates="permission_overrides")

    __table_args__ = (
        UniqueConstraint("page_id", "user_id", name="uq_page_user_override"),
    )


class PageApprovalRequest(Base):
    __tablename__ = "page_approval_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    page_id = Column(String(36), ForeignKey("pages.id", ondelete="CASCADE"), nullable=False)
    revision_id = Column(String(36), ForeignKey("page_revisions.id", ondelete="CASCADE"), nullable=True)
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime, nullable=True)

    page = relationship("Page", back_populates="approval_requests")

    __table_args__ = (
        Index("idx_approvals_status", "status"),
    )
