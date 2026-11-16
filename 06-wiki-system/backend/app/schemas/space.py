from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class SpaceCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = "Folder"
    is_public: Optional[bool] = True

class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_public: Optional[bool] = None

class SpaceMemberAdd(BaseModel):
    user_id: str
    role: str = "VIEWER"  # ADMIN, EDITOR, CONTRIBUTOR, VIEWER

class SpaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: str
    is_public: bool
    created_by_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
