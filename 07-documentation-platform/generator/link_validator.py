"""
Link Validation & Dead Anchor Auditor for Pixlo Documentation Platform.
Scans documentation markdown files for internal cross-references, verifies
document slug destinations, and ensures target anchor fragments exist.
"""

import re
from typing import Dict, Any, List, Set, Optional


class LinkAuditResult:
    def __init__(self):
        self.total_links_checked = 0
        self.valid_links_count = 0
        self.broken_links: List[Dict[str, Any]] = []

    @property
    def is_clean(self) -> bool:
        return len(self.broken_links) == 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_links_checked": self.total_links_checked,
            "valid_links_count": self.valid_links_count,
            "broken_links_count": len(self.broken_links),
            "is_clean": self.is_clean,
            "broken_links": self.broken_links
        }


class LinkValidator:
    def __init__(self, known_pages: Dict[str, Set[str]]):
        """
        known_pages: Dict mapping page_slug (or relative route) to a Set of anchor strings in that page.
        e.g. {"getting-started": {"installation", "prerequisites"}, "api/v1": {"overview"}}
        """
        self.known_pages = known_pages

    def audit_document(self, current_slug: str, raw_markdown: str) -> LinkAuditResult:
        """
        Audits all Markdown hyperlinks in the provided document.
        Syntax: [anchor text](link_target)
        """
        result = LinkAuditResult()
        link_regex = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

        lines = raw_markdown.splitlines()

        for line_num, line in enumerate(lines, 1):
            for match in link_regex.finditer(line):
                target_url = match.group(2).strip()

                # Skip external web protocols and mailto
                if target_url.startswith(("http://", "https://", "mailto:", "tel:", "javascript:")):
                    continue

                result.total_links_checked += 1

                # Parse slug and anchor fragment
                parts = target_url.split("#", 1)
                target_path = parts[0].strip().lstrip("/")
                anchor_fragment = parts[1].strip() if len(parts) > 1 else None

                # Normalization: if target_path is empty, it refers to current document
                check_slug = target_path if target_path else current_slug

                # Clean relative navigation like './'
                check_slug = re.sub(r"^\./", "", check_slug)
                # Strip trailing extensions like .html or .md
                check_slug = re.sub(r"\.(html|md)$", "", check_slug)

                # Check if target page exists
                if check_slug not in self.known_pages:
                    result.broken_links.append({
                        "source_slug": current_slug,
                        "line_number": line_num,
                        "target_url": target_url,
                        "resolved_slug": check_slug,
                        "reason": f"Target document '{check_slug}' does not exist"
                    })
                    continue

                # Check anchor existence if fragment specified
                if anchor_fragment:
                    valid_anchors = self.known_pages[check_slug]
                    if anchor_fragment not in valid_anchors:
                        result.broken_links.append({
                            "source_slug": current_slug,
                            "line_number": line_num,
                            "target_url": target_url,
                            "resolved_slug": check_slug,
                            "anchor": anchor_fragment,
                            "reason": f"Anchor '#{anchor_fragment}' not found in document '{check_slug}'"
                        })
                        continue

                result.valid_links_count += 1

        return result

    def audit_all(self, documents: Dict[str, str]) -> LinkAuditResult:
        """
        Audit a collection of documents: {slug: markdown_content}.
        """
        aggregated = LinkAuditResult()
        for slug, content in documents.items():
            doc_res = self.audit_document(slug, content)
            aggregated.total_links_checked += doc_res.total_links_checked
            aggregated.valid_links_count += doc_res.valid_links_count
            aggregated.broken_links.extend(doc_res.broken_links)
        return aggregated
