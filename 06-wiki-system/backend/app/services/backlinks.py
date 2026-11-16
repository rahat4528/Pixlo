import re
from typing import List, Dict, Set, Tuple, Any

class BacklinkExtractor:
    """
    Extracts internal wiki links and Markdown references from page markup
    and resolves bi-directional backlinks across pages.
    """
    
    # Matches [[target_slug]] or [[target_slug|label]]
    WIKI_LINK_REGEX = re.compile(r'\[\[([a-zA-Z0-9_\-]+)(?:\|([^\]]+))?\]\]')
    
    # Matches standard markdown links [label](/spaces/<space>/pages/<slug>) or [label](/pages/<slug>)
    MD_LINK_REGEX = re.compile(r'\[([^\]]+)\]\((?:/spaces/[a-zA-Z0-9_\-]+)?/pages/([a-zA-Z0-9_\-]+)\)')

    @classmethod
    def extract_links(cls, content: str) -> List[Dict[str, str]]:
        found_links: List[Dict[str, str]] = []
        seen_slugs: Set[str] = set()

        # 1. Wiki-style [[slug|label]]
        for match in cls.WIKI_LINK_REGEX.finditer(content):
            slug = match.group(1).strip().lower()
            label = (match.group(2) or slug).strip()
            if slug and slug not in seen_slugs:
                seen_slugs.add(slug)
                found_links.append({'target_slug': slug, 'link_label': label})

        # 2. Markdown-style [label](/pages/slug)
        for match in cls.MD_LINK_REGEX.finditer(content):
            label = match.group(1).strip()
            slug = match.group(2).strip().lower()
            if slug and slug not in seen_slugs:
                seen_slugs.add(slug)
                found_links.append({'target_slug': slug, 'link_label': label})

        return found_links

    @classmethod
    def reconcile_backlinks(
        cls, 
        source_page_id: str, 
        content: str, 
        existing_page_slug_to_id: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        extracted = cls.extract_links(content)
        records = []
        for item in extracted:
            target_slug = item['target_slug']
            target_page_id = existing_page_slug_to_id.get(target_slug)
            records.append({
                'source_page_id': source_page_id,
                'target_slug': target_slug,
                'target_page_id': target_page_id,
                'link_label': item['link_label'],
            })
        return records
