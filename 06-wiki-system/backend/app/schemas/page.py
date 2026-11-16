from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class PageCreate(BaseModel):
    title: str
    slug: str
    content: str
    parent_id: Optional[str] = None
    change_summary: Optional[str] = "Initial page creation"

class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    parent_id: Optional[str] = None
    change_summary: Optional[str] = "Page update"

class PageTreeItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    slug: str
    parent_id: Optional[str] = None
    sort_order: int
    children: List["PageTreeItem"] = []

class BacklinkItem(BaseModel):
    source_page_id: str
    source_title: str
    source_slug: str
    link_label: Optional[str] = None

class PageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    space_id: str
    parent_id: Optional[str] = None
    title: str
    slug: str
    content: str
    status: str
    current_revision: int
    sort_order: int
    author_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    inbound_backlinks: List[BacklinkItem] = []

class PageRevisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    page_id: str
    revision_number: int
    title: str
    content: str
    change_summary: Optional[str] = None
    author_id: Optional[str] = None
    created_at: Optional[datetime] = None

class DiffResponse(BaseModel):
    unified_diff: str
    hunks: List[Dict[str, Any]]
    stats: Dict[str, int]
