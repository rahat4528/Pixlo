from typing import Optional, Dict

ROLE_HIERARCHY = {
    'ADMIN': 4,
    'EDITOR': 3,
    'CONTRIBUTOR': 2,
    'VIEWER': 1,
    'NONE': 0,
}

ROLE_PERMISSIONS = {
    'ADMIN': {'read', 'write', 'delete', 'approve', 'manage_permissions'},
    'EDITOR': {'read', 'write', 'delete', 'approve'},
    'CONTRIBUTOR': {'read', 'write_draft'},
    'VIEWER': {'read'},
    'NONE': set(),
}

class PermissionEvaluator:
    """
    Evaluates inherited and overridden permissions for Wiki spaces and pages.
    """

    @classmethod
    def get_effective_role(
        cls,
        user_id: Optional[str],
        user_is_system_admin: bool,
        space_is_public: bool,
        space_member_role: Optional[str] = None,
        page_override_role: Optional[str] = None,
    ) -> str:
        # 1. System administrators always have top-level access
        if user_is_system_admin:
            return 'ADMIN'

        # 2. Page-level explicit override takes precedence
        if page_override_role and page_override_role.upper() in ROLE_HIERARCHY:
            return page_override_role.upper()

        # 3. Space-level membership role
        if space_member_role and space_member_role.upper() in ROLE_HIERARCHY:
            return space_member_role.upper()

        # 4. Public space fallback for readers
        if space_is_public:
            return 'VIEWER'

        return 'NONE'

    @classmethod
    def can(
        cls,
        action: str,
        user_id: Optional[str],
        user_is_system_admin: bool,
        space_is_public: bool,
        space_member_role: Optional[str] = None,
        page_override_role: Optional[str] = None,
    ) -> bool:
        role = cls.get_effective_role(
            user_id=user_id,
            user_is_system_admin=user_is_system_admin,
            space_is_public=space_is_public,
            space_member_role=space_member_role,
            page_override_role=page_override_role,
        )

        permissions = ROLE_PERMISSIONS.get(role, set())
        return action.lower() in permissions
