from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ApprovalRequestCreate(BaseModel):
    page_id: str
    revision_id: Optional[str] = None
    notes: Optional[str] = None

class ApprovalDecision(BaseModel):
    approve: bool
    notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    page_id: str
    revision_id: Optional[str] = None
    requester_id: str
    reviewer_id: Optional[str] = None
    status: str
    review_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
