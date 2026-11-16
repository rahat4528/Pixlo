import pytest
from generator.openapi_parser import OpenAPIParser


SAMPLE_OPENAPI_YAML = """
openapi: "3.0.3"
info:
  title: "Pixlo Core API"
  version: "1.2.0"
  description: "RESTful Content and Knowledge Engine"
servers:
  - url: "https://api.pixlo.local/v1"
    description: "Production Server"
paths:
  /articles:
    get:
      summary: "List all articles"
      tags:
        - Articles
      parameters:
        - name: "limit"
          in: "query"
          required: false
          schema:
            type: "integer"
      responses:
        "200":
          description: "Paginated list of articles"
    post:
      summary: "Create a new article"
      tags:
        - Articles
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: "object"
            example:
              title: "My First Article"
              slug: "my-first-article"
      responses:
        "201":
          description: "Article created"
  /health:
    get:
      summary: "Health Check"
      tags:
        - System
      responses:
        "200":
          description: "System healthy"
"""


def test_openapi_metadata():
    parser = OpenAPIParser(SAMPLE_OPENAPI_YAML)
    meta = parser.get_metadata()
    assert meta["title"] == "Pixlo Core API"
    assert meta["version"] == "1.2.0"
    assert meta["base_url"] == "https://api.pixlo.local/v1"


def test_openapi_endpoints_and_grouping():
    parser = OpenAPIParser(SAMPLE_OPENAPI_YAML)
    endpoints = parser.parse_endpoints()
    assert len(endpoints) == 3

    grouped = parser.group_by_tags()
    assert "Articles" in grouped
    assert "System" in grouped
    assert len(grouped["Articles"]) == 2
    assert len(grouped["System"]) == 1


def test_curl_snippet_generation():
    parser = OpenAPIParser(SAMPLE_OPENAPI_YAML)
    endpoints = parser.parse_endpoints()
    post_article = next(ep for ep in endpoints if ep["method"] == "POST")

    snippet = post_article["curl_snippet"]
    assert 'curl -X POST "https://api.pixlo.local/v1/articles"' in snippet
    assert '-H "Content-Type: application/json"' in snippet
    assert "My First Article" in snippet
