from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# Project Schemas
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    repository_url: Optional[str] = None
    default_version: str = "latest"


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: Optional[str] = None
    repository_url: Optional[str] = None
    default_version: str
    created_at: datetime
    updated_at: datetime


# Version Schemas
class VersionCreate(BaseModel):
    version_string: str = Field(..., min_length=1, max_length=50)
    is_prerelease: bool = False
    is_deprecated: bool = False
    is_default: bool = False


class VersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    version_string: str
    is_prerelease: bool
    is_deprecated: bool
    is_default: bool
    created_at: datetime


# Page Schemas
class PageCreate(BaseModel):
    version_id: str
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    raw_content: str
    path: Optional[str] = None
    order_index: int = 0
    parent_id: Optional[str] = None


class PageUpdate(BaseModel):
    title: Optional[str] = None
    raw_content: Optional[str] = None
    order_index: Optional[int] = None
    parent_id: Optional[str] = None


class PageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    version_id: str
    slug: str
    path: str
    title: str
    raw_content: str
    html_content: Optional[str] = None
    order_index: int
    parent_id: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


# OpenAPI Spec Schemas
class ApiSpecCreate(BaseModel):
    version_id: str
    title: str
    raw_spec: str


class ApiSpecResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    version_id: str
    title: str
    spec_type: str
    raw_spec: str
    parsed_endpoints_json: List[Dict[str, Any]]
    created_at: datetime


# Build Run Schemas
class BuildRunCreate(BaseModel):
    version_id: Optional[str] = None
    trigger_type: str = "MANUAL"


class BuildRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    version_id: Optional[str] = None
    trigger_type: str
    status: str
    total_pages: int
    broken_links_count: int
    build_duration_ms: int
    log_output: Optional[str] = None
    created_at: datetime


# Search Schemas
class SearchResultItem(BaseModel):
    id: str
    title: str
    slug: str
    version: str
    score: float
    snippet: str


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]
