"""
Version Management & Route Resolution Engine for Pixlo Documentation Platform.
Manages multi-version workspaces, semantic version sorting, version aliasing,
and deprecation/outdated notification banner generation.
"""

import re
from typing import List, Dict, Optional, Any


class DocVersion:
    def __init__(
        self,
        version_str: str,
        is_prerelease: bool = False,
        is_deprecated: bool = False,
        is_default: bool = False
    ):
        self.version_str = version_str
        self.is_prerelease = is_prerelease
        self.is_deprecated = is_deprecated
        self.is_default = is_default

    def semver_tuple(self):
        """Parse version string into tuple for sorting. Stable versions sort ahead of prereleases."""
        clean = self.version_str.lstrip("v").strip()
        match = re.match(r"^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([a-zA-Z0-9.]+))?", clean)
        if match:
            major = int(match.group(1))
            minor = int(match.group(2) or 0)
            patch = int(match.group(3) or 0)
            is_stable = 0 if (match.group(4) or self.is_prerelease) else 1
            return (is_stable, major, minor, patch)
        return (0, 0, 0, 0)


class VersionManager:
    def __init__(self, versions: Optional[List[DocVersion]] = None, aliases: Optional[Dict[str, str]] = None):
        self.versions: Dict[str, DocVersion] = {}
        self.aliases: Dict[str, str] = aliases or {}

        if versions:
            for v in versions:
                self.add_version(v)

    def add_version(self, version: DocVersion) -> None:
        self.versions[version.version_str] = version
        if version.is_default:
            self.aliases["latest"] = version.version_str
            self.aliases["current"] = version.version_str

    def get_sorted_versions(self, descending: bool = True) -> List[DocVersion]:
        """Returns versions ordered semantically."""
        return sorted(self.versions.values(), key=lambda v: v.semver_tuple(), reverse=descending)

    def get_latest_stable_version(self) -> Optional[DocVersion]:
        """Find latest non-prerelease version."""
        sorted_v = self.get_sorted_versions(descending=True)
        for v in sorted_v:
            if not v.is_prerelease and not v.is_deprecated:
                return v
        return sorted_v[0] if sorted_v else None

    def resolve_version(self, requested_version: str) -> str:
        """
        Resolves alias or version identifier to canonical version string.
        e.g. 'latest' -> 'v2.0.0'.
        """
        cleaned = requested_version.strip()
        if cleaned in self.aliases:
            return self.aliases[cleaned]
        if cleaned in self.versions:
            return cleaned
        # Default fallback
        latest = self.get_latest_stable_version()
        return latest.version_str if latest else requested_version

    def check_outdated_status(self, current_version_str: str, page_slug: str) -> Dict[str, Any]:
        """
        Determines whether the given version is older than latest,
        returning an advisory banner payload.
        """
        canonical_current = self.resolve_version(current_version_str)
        latest_version = self.get_latest_stable_version()

        if not latest_version:
            return {"is_outdated": False, "is_prerelease": False}

        current_obj = self.versions.get(canonical_current)
        is_pre = current_obj.is_prerelease if current_obj else False
        is_deprecated = current_obj.is_deprecated if current_obj else False

        if current_obj and latest_version:
            is_older = current_obj.semver_tuple() < latest_version.semver_tuple()
        else:
            is_older = False

        return {
            "is_outdated": is_older or is_deprecated,
            "is_prerelease": is_pre,
            "current_version": canonical_current,
            "latest_version": latest_version.version_str,
            "target_url": f"/docs/{latest_version.version_str}/{page_slug}",
            "banner_text": (
                f"You are viewing an older version ({canonical_current}). "
                f"Switch to the latest stable release ({latest_version.version_str})."
                if (is_older or is_deprecated)
                else (f"This is an unreleased preview ({canonical_current})." if is_pre else None)
            )
        }
