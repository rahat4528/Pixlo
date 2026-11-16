"""
Markdown and Frontmatter Parsing Engine for Pixlo Documentation Platform.
Handles YAML frontmatter extraction, custom documentation callouts/admonitions,
code block styling, and hierarchical table-of-contents (TOC) extraction.
"""

import re
import yaml
import markdown
from typing import Dict, Any, List, Tuple


class TableOfContentsEntry:
    def __init__(self, anchor_id: str, title: str, level: int):
        self.anchor_id = anchor_id
        self.title = title
        self.level = level
        self.children: List["TableOfContentsEntry"] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.anchor_id,
            "title": self.title,
            "level": self.level,
            "children": [child.to_dict() for child in self.children]
        }


def slugify(text: str) -> str:
    """Generate URL-safe slug for heading anchors."""
    clean = re.sub(r"[^\w\s-]", "", text.strip().lower())
    return re.sub(r"[-\s]+", "-", clean)


def parse_frontmatter(raw_text: str) -> Tuple[Dict[str, Any], str]:
    """
    Extract YAML frontmatter enclosed in --- at the start of markdown.
    Returns (metadata_dict, remaining_body).
    """
    if raw_text.startswith("---"):
        parts = raw_text.split("---", 2)
        if len(parts) >= 3:
            raw_yaml = parts[1].strip()
            body = parts[2].strip()
            try:
                metadata = yaml.safe_load(raw_yaml) or {}
                if isinstance(metadata, dict):
                    return metadata, body
            except Exception:
                pass
    return {}, raw_text


def transform_callouts(body: str) -> str:
    """
    Transform :::note, :::tip, :::warning, :::danger callout blocks into HTML alert containers.
    Syntax:
    :::note [Custom Title]
    Content
    :::
    """
    pattern = re.compile(
        r":::([a-zA-Z]+)(?:\s+(.*?))?\r?\n(.*?)\r?\n:::",
        re.DOTALL
    )

    def _replace_callout(match: re.Match) -> str:
        callout_type = match.group(1).lower()
        custom_title = match.group(2) or callout_type.capitalize()
        content = match.group(3).strip()

        type_styles = {
            "note": "doc-callout-note border-blue-500 bg-blue-50 text-blue-900",
            "tip": "doc-callout-tip border-emerald-500 bg-emerald-50 text-emerald-900",
            "warning": "doc-callout-warning border-amber-500 bg-amber-50 text-amber-900",
            "danger": "doc-callout-danger border-rose-500 bg-rose-50 text-rose-900",
            "info": "doc-callout-info border-cyan-500 bg-cyan-50 text-cyan-900"
        }
        classes = type_styles.get(callout_type, "doc-callout-default border-slate-500 bg-slate-50 text-slate-900")

        return (
            f'<div class="doc-callout border-l-4 p-4 my-4 rounded-r {classes}" role="alert">'
            f'<div class="font-bold text-sm mb-1">{custom_title}</div>'
            f'<div class="text-sm leading-relaxed">{content}</div>'
            f'</div>'
        )

    return pattern.sub(_replace_callout, body)


def extract_table_of_contents(markdown_text: str) -> Tuple[List[Dict[str, Any]], str]:
    """
    Parses Markdown headings (h2-h4), assigns slug anchor IDs, and builds a hierarchical TOC.
    Returns (toc_list, markdown_with_anchors).
    """
    heading_pattern = re.compile(r"^(#{2,4})\s+(.+)$", re.MULTILINE)
    toc_flat: List[TableOfContentsEntry] = []
    seen_anchors: Dict[str, int] = {}

    def _process_heading(match: re.Match) -> str:
        hashes = match.group(1)
        level = len(hashes)
        title = match.group(2).strip()
        base_anchor = slugify(title)

        if base_anchor in seen_anchors:
            seen_anchors[base_anchor] += 1
            anchor_id = f"{base_anchor}-{seen_anchors[base_anchor]}"
        else:
            seen_anchors[base_anchor] = 1
            anchor_id = base_anchor

        entry = TableOfContentsEntry(anchor_id, title, level)
        toc_flat.append(entry)

        return f'{hashes} <span id="{anchor_id}">{title}</span>'

    anchored_markdown = heading_pattern.sub(_process_heading, markdown_text)

    # Build hierarchical tree from flat list
    root_entries: List[TableOfContentsEntry] = []
    stack: List[TableOfContentsEntry] = []

    for entry in toc_flat:
        while stack and stack[-1].level >= entry.level:
            stack.pop()

        if not stack:
            root_entries.append(entry)
        else:
            stack[-1].children.append(entry)
        stack.append(entry)

    return [r.to_dict() for r in root_entries], anchored_markdown


def render_markdown(raw_text: str) -> Dict[str, Any]:
    """
    Full pipeline: extracts frontmatter, transforms callouts, extracts TOC,
    and renders standard Markdown to sanitized HTML.
    """
    frontmatter, body = parse_frontmatter(raw_text)
    body_with_callouts = transform_callouts(body)
    toc, anchored_body = extract_table_of_contents(body_with_callouts)

    html = markdown.markdown(
        anchored_body,
        extensions=["fenced_code", "tables", "nl2br", "sane_lists"]
    )

    return {
        "metadata": frontmatter,
        "title": frontmatter.get("title") or (toc[0]["title"] if toc else "Untitled Document"),
        "toc": toc,
        "html": html,
        "raw_body": body
    }
