import pytest
from app.services.approvals import ApprovalWorkflowEngine

def test_valid_page_transitions():
    assert ApprovalWorkflowEngine.can_transition('DRAFT', 'IN_REVIEW') is True
    assert ApprovalWorkflowEngine.can_transition('IN_REVIEW', 'PUBLISHED') is True
    assert ApprovalWorkflowEngine.can_transition('IN_REVIEW', 'DRAFT') is True
    assert ApprovalWorkflowEngine.can_transition('PUBLISHED', 'ARCHIVED') is True
    assert ApprovalWorkflowEngine.can_transition('ARCHIVED', 'IN_REVIEW') is False

def test_process_review_submission():
    result = ApprovalWorkflowEngine.process_review_submission('DRAFT')
    assert result['page_status'] == 'IN_REVIEW'
    assert result['approval_status'] == 'PENDING'

def test_approval_decision_approve():
    decision = ApprovalWorkflowEngine.process_approval_decision(
        current_status='IN_REVIEW',
        approve=True,
        reviewer_id='editor-uuid',
        notes='LGTM, meets technical writing standards.'
    )
    assert decision['page_status'] == 'PUBLISHED'
    assert decision['approval_status'] == 'APPROVED'
    assert decision['reviewer_id'] == 'editor-uuid'

def test_approval_decision_reject():
    decision = ApprovalWorkflowEngine.process_approval_decision(
        current_status='IN_REVIEW',
        approve=False,
        reviewer_id='editor-uuid',
        notes='Please add architectural diagram.'
    )
    assert decision['page_status'] == 'DRAFT'
    assert decision['approval_status'] == 'REJECTED'
    assert "architectural diagram" in decision['review_notes']
