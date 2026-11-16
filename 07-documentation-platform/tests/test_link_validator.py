import pytest
from generator.link_validator import LinkValidator


def test_link_validator_clean():
    known_pages = {
        "intro": {"welcome", "prerequisites"},
        "installation": {"docker-setup", "env-vars"}
    }
    validator = LinkValidator(known_pages)

    doc_text = """
Check out the [Installation Guide](installation) before proceeding.
Also see [Docker Setup](installation#docker-setup).
For external info, see [GitHub](https://github.com/example/repo).
"""
    result = validator.audit_document("intro", doc_text)
    assert result.is_clean is True
    assert result.total_links_checked == 2
    assert result.valid_links_count == 2
    assert len(result.broken_links) == 0


def test_link_validator_broken_doc():
    known_pages = {
        "intro": {"welcome"}
    }
    validator = LinkValidator(known_pages)

    doc_text = """
Refer to the [Missing Guide](non-existent-guide) for details.
"""
    result = validator.audit_document("intro", doc_text)
    assert result.is_clean is False
    assert len(result.broken_links) == 1
    assert "non-existent-guide" in result.broken_links[0]["target_url"]


def test_link_validator_broken_anchor():
    known_pages = {
        "intro": {"welcome"},
        "setup": {"docker"}
    }
    validator = LinkValidator(known_pages)

    doc_text = """
See [Kubernetes Setup](setup#k8s-missing-anchor).
"""
    result = validator.audit_document("intro", doc_text)
    assert result.is_clean is False
    assert len(result.broken_links) == 1
    assert result.broken_links[0]["anchor"] == "k8s-missing-anchor"
