"""
Static Site Generator (SSG) Builder Engine for Pixlo Documentation Platform.
Orchestrates Markdown parsing, multi-version layouts, TOC generation, link validation,
search indexing, OpenAPI reference rendering, and static HTML compilation.
"""

import os
import time
import json
from typing import Dict, Any, List, Optional
from jinja2 import Environment, FileSystemLoader

from .markdown_parser import render_markdown
from .version_manager import VersionManager, DocVersion
from .openapi_parser import OpenAPIParser
from .link_validator import LinkValidator, LinkAuditResult
from .search_indexer import SearchIndexer


class DocumentationBuilder:
    def __init__(
        self,
        project_name: str,
        templates_dir: str,
        output_dir: str,
        versions: Optional[List[DocVersion]] = None
    ):
        self.project_name = project_name
        self.templates_dir = templates_dir
        self.output_dir = output_dir
        self.version_manager = VersionManager(versions or [DocVersion("v1.0.0", is_default=True)])

        # Set up Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.templates_dir),
            autoescape=True
        )

    def build_project(
        self,
        pages_by_version: Dict[str, List[Dict[str, Any]]],
        openapi_specs_by_version: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Build full documentation site across all versions.
        pages_by_version: {
            "v1.0.0": [
                {"slug": "index", "title": "Home", "raw_content": "..."},
                {"slug": "getting-started", "title": "Getting Started", "raw_content": "..."}
            ]
        }
        """
        start_time = time.time()
        os.makedirs(self.output_dir, exist_ok=True)

        total_pages_built = 0
        all_broken_links: List[Dict[str, Any]] = []
        search_indexer = SearchIndexer()
        available_versions = self.version_manager.get_sorted_versions()

        openapi_specs_by_version = openapi_specs_by_version or {}

        # First pass: Parse markdown, extract TOC, build anchor maps for link validation
        version_parsed_pages: Dict[str, Dict[str, Any]] = {}
        version_anchor_maps: Dict[str, Dict[str, set]] = {}

        for ver_str, page_list in pages_by_version.items():
            version_parsed_pages[ver_str] = {}
            version_anchor_maps[ver_str] = {}

            # If OpenAPI spec exists for this version, register api-reference as valid target
            if ver_str in openapi_specs_by_version:
                version_anchor_maps[ver_str]["api-reference"] = set()

            for page in page_list:
                slug = page["slug"]
                raw_content = page["raw_content"]
                parsed = render_markdown(raw_content)

                # Extract anchors from TOC
                anchors = set()
                def _collect_anchors(toc_items):
                    for item in toc_items:
                        anchors.add(item["id"])
                        _collect_anchors(item.get("children", []))
                _collect_anchors(parsed["toc"])

                version_parsed_pages[ver_str][slug] = {
                    "slug": slug,
                    "title": page.get("title") or parsed["title"],
                    "parsed": parsed,
                    "raw_content": raw_content,
                    "anchors": anchors
                }
                version_anchor_maps[ver_str][slug] = anchors

        # Second pass: Link validation per version
        for ver_str, pages_dict in version_parsed_pages.items():
            validator = LinkValidator(version_anchor_maps[ver_str])
            raw_docs = {s: p["raw_content"] for s, p in pages_dict.items()}
            audit_res = validator.audit_all(raw_docs)
            for bl in audit_res.broken_links:
                bl["version"] = ver_str
                all_broken_links.append(bl)

        # Third pass: Render templates and write static files
        page_template = self.jinja_env.get_template("page.html")
        api_template = self.jinja_env.get_template("api_reference.html")

        generated_files = []

        for ver_str, pages_dict in version_parsed_pages.items():
            ver_dir = os.path.join(self.output_dir, ver_str)
            os.makedirs(ver_dir, exist_ok=True)

            navigation_pages = [
                {"slug": s, "title": p["title"]}
                for s, p in pages_dict.items()
            ]

            has_api = ver_str in openapi_specs_by_version

            for slug, page_data in pages_dict.items():
                outdated_info = self.version_manager.check_outdated_status(ver_str, slug)
                parsed = page_data["parsed"]

                rendered_html = page_template.render(
                    project_name=self.project_name,
                    page_title=page_data["title"],
                    current_slug=slug,
                    current_version=ver_str,
                    available_versions=available_versions,
                    navigation_pages=navigation_pages,
                    content_html=parsed["html"],
                    toc=parsed["toc"],
                    outdated_info=outdated_info,
                    openapi_spec_available=has_api
                )

                file_path = os.path.join(ver_dir, f"{slug}.html")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(rendered_html)

                generated_files.append(file_path)
                total_pages_built += 1

                # Feed into search index
                headings = [t["title"] for t in parsed["toc"]]
                search_indexer.add_document(
                    doc_id=f"{ver_str}/{slug}",
                    title=page_data["title"],
                    slug=slug,
                    body=parsed["raw_body"],
                    headings=headings,
                    version=ver_str
                )

            # Build OpenAPI reference if spec provided
            if has_api:
                api_spec_raw = openapi_specs_by_version[ver_str]
                parser = OpenAPIParser(api_spec_raw)
                meta = parser.get_metadata()
                endpoints = parser.parse_endpoints()
                grouped = parser.group_by_tags()

                api_html = api_template.render(
                    project_name=self.project_name,
                    page_title=f"{meta['title']} — API Reference",
                    current_slug="api-reference",
                    current_version=ver_str,
                    available_versions=available_versions,
                    navigation_pages=navigation_pages,
                    api_meta=meta,
                    endpoints=endpoints,
                    grouped_endpoints=grouped,
                    outdated_info=self.version_manager.check_outdated_status(ver_str, "api-reference"),
                    openapi_spec_available=True
                )

                api_file_path = os.path.join(ver_dir, "api-reference.html")
                with open(api_file_path, "w", encoding="utf-8") as f:
                    f.write(api_html)
                generated_files.append(api_file_path)
                total_pages_built += 1

        # Export search index JSON
        search_index_path = os.path.join(self.output_dir, "search-index.json")
        with open(search_index_path, "w", encoding="utf-8") as f:
            json.dump(search_indexer.export_index(), f, indent=2)
        generated_files.append(search_index_path)

        duration_ms = int((time.time() - start_time) * 1000)

        return {
            "project_name": self.project_name,
            "total_pages_built": total_pages_built,
            "broken_links_count": len(all_broken_links),
            "broken_links": all_broken_links,
            "generated_files": generated_files,
            "build_duration_ms": duration_ms,
            "search_index_path": search_index_path
        }
