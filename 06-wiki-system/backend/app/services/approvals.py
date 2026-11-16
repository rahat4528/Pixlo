from typing import Dict, Any, Optional

PAGE_TRANSITIONS = {
    'DRAFT': ['IN_REVIEW', 'PUBLISHED', 'ARCHIVED'],
    'IN_REVIEW': ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
    'PUBLISHED': ['DRAFT', 'IN_REVIEW', 'ARCHIVED'],
    'ARCHIVED': ['DRAFT'],
}

class ApprovalWorkflowEngine:
    """
    Manages Wiki page publication and review state transitions.
    """

    @staticmethod
    def can_transition(current_status: str, target_status: str) -> bool:
        allowed = PAGE_TRANSITIONS.get(current_status.upper(), [])
        return target_status.upper() in allowed

    @staticmethod
    def process_review_submission(current_status: str) -> Dict[str, Any]:
        if not ApprovalWorkflowEngine.can_transition(current_status, 'IN_REVIEW'):
            raise ValueError(f"Cannot submit page in '{current_status}' for review")

        return {
            'page_status': 'IN_REVIEW',
            'approval_status': 'PENDING',
        }

    @staticmethod
    def process_approval_decision(current_status: str, approve: bool, reviewer_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        if current_status != 'IN_REVIEW':
            raise ValueError(f"Cannot decide on page in '{current_status}' status. Page must be IN_REVIEW.")

        if approve:
            return {
                'page_status': 'PUBLISHED',
                'approval_status': 'APPROVED',
                'reviewer_id': reviewer_id,
                'review_notes': notes or "Approved for publication",
            }
        else:
            return {
                'page_status': 'DRAFT',
                'approval_status': 'REJECTED',
                'reviewer_id': reviewer_id,
                'review_notes': notes or "Changes requested",
            }
