import pytest
from app.services.backlinks import BacklinkExtractor

def test_extract_wiki_links_and_labels():
    content = """
    # Project Documentation
    Please refer to [[architecture-guidelines]] for standards.
    Also see [[deployment-pipeline|Production Deployment Guide]] for release details.
    """

    links = BacklinkExtractor.extract_links(content)

    assert len(links) == 2
    assert links[0]['target_slug'] == 'architecture-guidelines'
    assert links[0]['link_label'] == 'architecture-guidelines'

    assert links[1]['target_slug'] == 'deployment-pipeline'
    assert links[1]['link_label'] == 'Production Deployment Guide'

def test_extract_markdown_links():
    content = """
    Check out the [API Reference](/spaces/engineering/pages/api-specs) and
    [Security Checklist](/pages/security-checklist).
    """

    links = BacklinkExtractor.extract_links(content)

    assert len(links) == 2
    slugs = [l['target_slug'] for l in links]
    assert 'api-specs' in slugs
    assert 'security-checklist' in slugs

def test_reconcile_backlinks_with_existing_pages():
    content = "Read [[api-specs]] and [[unknown-future-page]]."
    slug_to_id_map = {
        'api-specs': 'page-uuid-123'
    }

    reconciled = BacklinkExtractor.reconcile_backlinks('source-uuid', content, slug_to_id_map)

    assert len(reconciled) == 2
    api_spec = next(r for r in reconciled if r['target_slug'] == 'api-specs')
    assert api_spec['target_page_id'] == 'page-uuid-123'

    future_page = next(r for r in reconciled if r['target_slug'] == 'unknown-future-page')
    assert future_page['target_page_id'] is None
