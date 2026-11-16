import pytest
from app.services.permissions import PermissionEvaluator

def test_system_admin_has_all_permissions():
    can_delete = PermissionEvaluator.can(
        action='delete',
        user_id='admin-user',
        user_is_system_admin=True,
        space_is_public=False,
    )
    assert can_delete is True

def test_page_override_overrides_space_membership():
    # User is EDITOR on space, but page explicitly sets role to VIEWER
    can_write = PermissionEvaluator.can(
        action='write',
        user_id='user-1',
        user_is_system_admin=False,
        space_is_public=False,
        space_member_role='EDITOR',
        page_override_role='VIEWER',
    )
    assert can_write is False

    can_read = PermissionEvaluator.can(
        action='read',
        user_id='user-1',
        user_is_system_admin=False,
        space_is_public=False,
        space_member_role='EDITOR',
        page_override_role='VIEWER',
    )
    assert can_read is True

def test_public_space_viewer_fallback():
    can_read = PermissionEvaluator.can(
        action='read',
        user_id='anon-user',
        user_is_system_admin=False,
        space_is_public=True,
        space_member_role=None,
    )
    assert can_read is True

    can_write = PermissionEvaluator.can(
        action='write',
        user_id='anon-user',
        user_is_system_admin=False,
        space_is_public=True,
        space_member_role=None,
    )
    assert can_write is False

def test_contributor_can_write_draft_but_not_publish():
    can_write_draft = PermissionEvaluator.can(
        action='write_draft',
        user_id='contrib-user',
        user_is_system_admin=False,
        space_is_public=False,
        space_member_role='CONTRIBUTOR',
    )
    assert can_write_draft is True

    can_approve = PermissionEvaluator.can(
        action='approve',
        user_id='contrib-user',
        user_is_system_admin=False,
        space_is_public=False,
        space_member_role='CONTRIBUTOR',
    )
    assert can_approve is False
