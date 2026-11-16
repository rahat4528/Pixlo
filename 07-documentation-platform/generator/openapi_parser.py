"""
OpenAPI 3.x Parser & Interactive API Reference Generator for Pixlo Documentation Platform.
Parses OpenAPI specifications (JSON or YAML), groups endpoints by tag,
extracts parameters and response schemas, and generates runnable cURL snippets.
"""

import json
import yaml
from typing import Dict, Any, List, Optional


class OpenAPIParser:
    def __init__(self, raw_spec: str):
        self.raw_spec = raw_spec.strip()
        self.spec = self._parse_raw(self.raw_spec)

    def _parse_raw(self, content: str) -> Dict[str, Any]:
        """Parse JSON or YAML string."""
        if content.startswith("{"):
            try:
                return json.loads(content)
            except Exception:
                pass
        try:
            return yaml.safe_load(content) or {}
        except Exception as e:
            raise ValueError(f"Invalid OpenAPI specification syntax: {str(e)}")

    def get_metadata(self) -> Dict[str, Any]:
        """Extract root info and server definitions."""
        info = self.spec.get("info", {})
        servers = self.spec.get("servers", [])
        base_url = servers[0]["url"] if servers and "url" in servers[0] else "https://api.example.com"

        return {
            "title": info.get("title", "API Reference"),
            "version": info.get("version", "1.0.0"),
            "description": info.get("description", ""),
            "base_url": base_url,
            "servers": servers
        }

    def generate_curl_snippet(self, method: str, path: str, base_url: str, params: List[Dict[str, Any]], request_body: Optional[Dict[str, Any]]) -> str:
        """Constructs a runnable cURL command string."""
        url = f"{base_url.rstrip('/')}{path}"
        lines = [f"curl -X {method.upper()} \"{url}\""]

        lines.append('  -H "Accept: application/json"')

        for p in params:
            if p.get("in") == "header":
                lines.append(f'  -H "{p.get("name")}: <value>"')

        if request_body and method.upper() in ["POST", "PUT", "PATCH"]:
            lines.append('  -H "Content-Type: application/json"')
            example_data = request_body.get("example")
            if example_data:
                json_str = json.dumps(example_data)
            else:
                json_str = '{"sample": "data"}'
            lines.append(f"  -d '{json_str}'")

        return " \\\n".join(lines)

    def parse_endpoints(self) -> List[Dict[str, Any]]:
        """
        Parses all operations across all paths and organizes them by tag.
        """
        meta = self.get_metadata()
        base_url = meta["base_url"]
        paths = self.spec.get("paths", {})
        endpoints: List[Dict[str, Any]] = []

        valid_methods = {"get", "post", "put", "delete", "patch", "options", "head"}

        for path_str, path_item in paths.items():
            if not isinstance(path_item, dict):
                continue

            common_params = path_item.get("parameters", [])

            for method, operation in path_item.items():
                if method.lower() not in valid_methods or not isinstance(operation, dict):
                    continue

                operation_id = operation.get("operationId", f"{method}_{path_str.replace('/', '_')}")
                tags = operation.get("tags", ["General"])
                summary = operation.get("summary", f"{method.upper()} {path_str}")
                description = operation.get("description", "")

                # Combine common and operation parameters
                op_params = operation.get("parameters", [])
                all_params = common_params + op_params

                parsed_params = []
                for p in all_params:
                    if isinstance(p, dict):
                        parsed_params.append({
                            "name": p.get("name", ""),
                            "in": p.get("in", "query"),
                            "required": p.get("required", False),
                            "description": p.get("description", ""),
                            "schema_type": p.get("schema", {}).get("type", "string")
                        })

                # Request body parsing
                request_body_info = None
                rb = operation.get("requestBody")
                if isinstance(rb, dict):
                    content = rb.get("content", {})
                    json_media = content.get("application/json", {})
                    schema = json_media.get("schema", {})
                    example = json_media.get("example") or schema.get("example")
                    request_body_info = {
                        "required": rb.get("required", False),
                        "description": rb.get("description", ""),
                        "schema": schema,
                        "example": example
                    }

                # Responses
                responses_dict = {}
                responses_raw = operation.get("responses", {})
                for code, res_obj in responses_raw.items():
                    if isinstance(res_obj, dict):
                        res_content = res_obj.get("content", {}).get("application/json", {})
                        responses_dict[str(code)] = {
                            "description": res_obj.get("description", ""),
                            "schema": res_content.get("schema", {}),
                            "example": res_content.get("example")
                        }

                curl_snippet = self.generate_curl_snippet(
                    method=method,
                    path=path_str,
                    base_url=base_url,
                    params=parsed_params,
                    request_body=request_body_info
                )

                endpoints.append({
                    "id": operation_id,
                    "method": method.upper(),
                    "path": path_str,
                    "tag": tags[0] if tags else "General",
                    "tags": tags,
                    "summary": summary,
                    "description": description,
                    "parameters": parsed_params,
                    "request_body": request_body_info,
                    "responses": responses_dict,
                    "curl_snippet": curl_snippet
                })

        return endpoints

    def group_by_tags(self) -> Dict[str, List[Dict[str, Any]]]:
        """Group parsed endpoints by tag."""
        endpoints = self.parse_endpoints()
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for ep in endpoints:
            tag = ep["tag"]
            if tag not in grouped:
                grouped[tag] = []
            grouped[tag].append(ep)
        return grouped
