import os
import shutil
import pytest
from generator.builder import DocumentationBuilder
from generator.version_manager import DocVersion


def test_builder_end_to_end(tmp_path):
    templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "templates"))
    output_dir = str(tmp_path / "dist")

    v1 = DocVersion("v1.0.0")
    v2 = DocVersion("v2.0.0", is_default=True)

    builder = DocumentationBuilder(
        project_name="Pixlo Test Engine",
        templates_dir=templates_dir,
        output_dir=output_dir,
        versions=[v1, v2]
    )

    pages = {
        "v1.0.0": [
            {
                "slug": "index",
                "title": "Home v1",
                "raw_content": """---
title: Home v1
---
## Welcome
Welcome to v1 documentation. Check the [Guide](guide).
"""
            },
            {
                "slug": "guide",
                "title": "Guide v1",
                "raw_content": """---
title: Guide v1
---
## Getting Started
Follow these steps.
"""
            }
        ],
        "v2.0.0": [
            {
                "slug": "index",
                "title": "Home v2",
                "raw_content": """---
title: Home v2
---
## What is New
Welcome to v2! See [API Reference](api-reference).
"""
            }
        ]
    }

    openapi_specs = {
        "v2.0.0": """
openapi: "3.0.0"
info:
  title: "V2 Test API"
  version: "2.0.0"
paths:
  /users:
    get:
      summary: "List users"
      responses:
        "200":
          description: "OK"
"""
    }

    build_result = builder.build_project(pages, openapi_specs)

    assert build_result["total_pages_built"] == 4  # v1: index, guide; v2: index, api-reference
    assert build_result["broken_links_count"] == 0
    assert os.path.exists(os.path.join(output_dir, "v1.0.0", "index.html"))
    assert os.path.exists(os.path.join(output_dir, "v1.0.0", "guide.html"))
    assert os.path.exists(os.path.join(output_dir, "v2.0.0", "index.html"))
    assert os.path.exists(os.path.join(output_dir, "v2.0.0", "api-reference.html"))
    assert os.path.exists(os.path.join(output_dir, "search-index.json"))

    # Verify content of generated index.html
    with open(os.path.join(output_dir, "v1.0.0", "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
        assert "Pixlo Test Engine" in html
        assert "Welcome to v1 documentation" in html
        # Should have outdated warning banner because v2.0.0 is latest!
        assert "older version" in html
