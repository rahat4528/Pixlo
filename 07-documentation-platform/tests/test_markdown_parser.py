import pytest
from generator.markdown_parser import (
    parse_frontmatter,
    transform_callouts,
    extract_table_of_contents,
    render_markdown
)


def test_parse_frontmatter():
    raw = """---
title: "Getting Started Guide"
slug: "getting-started"
tags:
  - introduction
  - quickstart
order: 1
---

# Main Content
Welcome to the documentation.
"""
    meta, body = parse_frontmatter(raw)
    assert meta["title"] == "Getting Started Guide"
    assert meta["slug"] == "getting-started"
    assert "introduction" in meta["tags"]
    assert meta["order"] == 1
    assert body.startswith("# Main Content")


def test_transform_callouts():
    text = """
:::note Pro Tip
Remember to configure your API keys.
:::

:::warning Danger Zone
Do not execute this in production without backup.
:::
"""
    transformed = transform_callouts(text)
    assert 'class="doc-callout border-l-4 p-4 my-4 rounded-r doc-callout-note' in transformed
    assert "Pro Tip" in transformed
    assert "Remember to configure your API keys." in transformed
    assert 'doc-callout-warning' in transformed
    assert "Danger Zone" in transformed


def test_extract_table_of_contents():
    markdown = """
## Prerequisites
Make sure Docker is installed.

### System Requirements
Minimum 4GB RAM.

## Installation Steps
Run docker-compose.

### Linux
Run apt install.

#### Ubuntu Specifics
Use standard PPA.
"""
    toc, anchored = extract_table_of_contents(markdown)
    assert len(toc) == 2
    assert toc[0]["title"] == "Prerequisites"
    assert toc[0]["id"] == "prerequisites"
    assert len(toc[0]["children"]) == 1
    assert toc[0]["children"][0]["title"] == "System Requirements"

    assert toc[1]["title"] == "Installation Steps"
    assert len(toc[1]["children"]) == 1
    assert toc[1]["children"][0]["title"] == "Linux"
    assert len(toc[1]["children"][0]["children"]) == 1
    assert toc[1]["children"][0]["children"][0]["title"] == "Ubuntu Specifics"

    assert '<span id="prerequisites">' in anchored


def test_render_markdown_pipeline():
    raw = """---
title: "Architecture"
---
## System Design
Overview of services.

:::tip Architecture Tip
Keep services decoupled.
:::
"""
    result = render_markdown(raw)
    assert result["title"] == "Architecture"
    assert len(result["toc"]) == 1
    assert "<h2" in result["html"]
    assert "doc-callout-tip" in result["html"]
