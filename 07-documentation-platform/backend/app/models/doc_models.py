import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from ..db.session import Base


class DocProject(Base):
    __tablename__ = "doc_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    repository_url = Column(String(500), nullable=True)
    default_version = Column(String(50), default="latest")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship("DocVersion", back_populates="project", cascade="all, delete-orphan")
    pages = relationship("DocPage", back_populates="project", cascade="all, delete-orphan")
    api_specs = relationship("DocApiSpec", back_populates="project", cascade="all, delete-orphan")
    build_runs = relationship("DocBuildRun", back_populates="project", cascade="all, delete-orphan")


class DocVersion(Base):
    __tablename__ = "doc_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("doc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    version_string = Column(String(50), nullable=False)
    is_prerelease = Column(Boolean, default=False)
    is_deprecated = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("DocProject", back_populates="versions")
    pages = relationship("DocPage", back_populates="version", cascade="all, delete-orphan")
    api_specs = relationship("DocApiSpec", back_populates="version", cascade="all, delete-orphan")


class DocPage(Base):
    __tablename__ = "doc_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("doc_projects.id", ondelete="CASCADE"), nullable=False)
    version_id = Column(String(36), ForeignKey("doc_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    path = Column(String(500), nullable=False)
    title = Column(String(255), nullable=False)
    raw_content = Column(Text, nullable=False)
    html_content = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    parent_id = Column(String(36), ForeignKey("doc_pages.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("DocProject", back_populates="pages")
    version = relationship("DocVersion", back_populates="pages")


class DocApiSpec(Base):
    __tablename__ = "doc_api_specs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("doc_projects.id", ondelete="CASCADE"), nullable=False)
    version_id = Column(String(36), ForeignKey("doc_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    spec_type = Column(String(20), default="OPENAPI_3")
    raw_spec = Column(Text, nullable=False)
    parsed_endpoints_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("DocProject", back_populates="api_specs")
    version = relationship("DocVersion", back_populates="api_specs")


class DocBuildRun(Base):
    __tablename__ = "doc_build_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("doc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id = Column(String(36), ForeignKey("doc_versions.id", ondelete="SET NULL"), nullable=True)
    trigger_type = Column(String(50), default="MANUAL")
    status = Column(String(50), default="PENDING")
    total_pages = Column(Integer, default=0)
    broken_links_count = Column(Integer, default=0)
    build_duration_ms = Column(Integer, default=0)
    log_output = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("DocProject", back_populates="build_runs")
