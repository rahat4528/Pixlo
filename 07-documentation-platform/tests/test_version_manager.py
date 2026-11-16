import pytest
from generator.version_manager import VersionManager, DocVersion


def test_semver_sorting():
    v1 = DocVersion("v1.0.0")
    v2 = DocVersion("v2.0.0", is_default=True)
    v1_5 = DocVersion("v1.5.0")
    v3_rc = DocVersion("v3.0.0-rc1", is_prerelease=True)

    vm = VersionManager([v1, v2, v1_5, v3_rc])
    sorted_v = vm.get_sorted_versions(descending=True)

    assert sorted_v[0].version_str == "v2.0.0"
    assert sorted_v[1].version_str == "v1.5.0"
    assert sorted_v[2].version_str == "v1.0.0"
    assert sorted_v[3].version_str == "v3.0.0-rc1"


def test_version_aliasing():
    v1 = DocVersion("v1.0.0")
    v2 = DocVersion("v2.0.0", is_default=True)

    vm = VersionManager([v1, v2])
    assert vm.resolve_version("latest") == "v2.0.0"
    assert vm.resolve_version("current") == "v2.0.0"
    assert vm.resolve_version("v1.0.0") == "v1.0.0"


def test_outdated_version_banner():
    v1 = DocVersion("v1.0.0")
    v2 = DocVersion("v2.0.0", is_default=True)

    vm = VersionManager([v1, v2])

    banner_v1 = vm.check_outdated_status("v1.0.0", "getting-started")
    assert banner_v1["is_outdated"] is True
    assert banner_v1["latest_version"] == "v2.0.0"
    assert banner_v1["target_url"] == "/docs/v2.0.0/getting-started"
    assert "older version" in banner_v1["banner_text"]

    banner_v2 = vm.check_outdated_status("v2.0.0", "getting-started")
    assert banner_v2["is_outdated"] is False
