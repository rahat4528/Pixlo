"""
Pixlo Documentation Platform Static Site Generator Package
"""

from .markdown_parser import render_markdown, parse_frontmatter, extract_table_of_contents
from .version_manager import VersionManager, DocVersion
from .openapi_parser import OpenAPIParser
from .link_validator import LinkValidator, LinkAuditResult
from .search_indexer import SearchIndexer
from .builder import DocumentationBuilder

__all__ = [
    "render_markdown",
    "parse_frontmatter",
    "extract_table_of_contents",
    "VersionManager",
    "DocVersion",
    "OpenAPIParser",
    "LinkValidator",
    "LinkAuditResult",
    "SearchIndexer",
    "DocumentationBuilder"
]
