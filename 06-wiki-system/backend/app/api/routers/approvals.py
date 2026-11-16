from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models import Page, PageApprovalRequest, SpaceMember, User
from app.schemas.approval import ApprovalDecision, ApprovalResponse
from app.api.deps import get_current_user
from app.services.approvals import ApprovalWorkflowEngine

router = APIRouter(tags=["Approvals"])

@router.post("/pages/{page_id}/submit-review", response_model=ApprovalResponse)
def submit_page_for_review(
    page_id: str,
    notes: Optional[str] = Query(None, description="Review notes / submission summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    try:
        proc = ApprovalWorkflowEngine.process_review_submission(page.status)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    page.status = proc['page_status']

    req = PageApprovalRequest(
        page_id=page.id,
        requester_id=current_user.id,
        status=proc['approval_status'],
        review_notes=notes,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.post("/approvals/{request_id}/decide", response_model=ApprovalResponse)
def decide_approval_request(
    request_id: str,
    dto: ApprovalDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(PageApprovalRequest).filter(PageApprovalRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    page = req.page
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated page not found")

    try:
        proc = ApprovalWorkflowEngine.process_approval_decision(
            current_status=page.status,
            approve=dto.approve,
            reviewer_id=current_user.id,
            notes=dto.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    page.status = proc['page_status']
    req.status = proc['approval_status']
    req.reviewer_id = current_user.id
    req.review_notes = proc['review_notes']
    req.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(req)
    return req

@router.get("/approvals", response_model=List[ApprovalResponse])
def list_approvals(
    status_filter: Optional[str] = Query(None, description="PENDING, APPROVED, REJECTED"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PageApprovalRequest)
    if status_filter:
        query = query.filter(PageApprovalRequest.status == status_filter.upper())
    return query.order_by(PageApprovalRequest.created_at.desc()).all()
