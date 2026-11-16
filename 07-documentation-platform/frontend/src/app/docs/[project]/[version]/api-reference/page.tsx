"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../../../../components/Navigation";
import { Terminal, Copy, Check, ChevronRight } from "lucide-react";

interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  tag: string;
  summary: string;
  description: string;
  parameters: Array<{ name: string; in: string; required: boolean; description: string }>;
  curlSnippet: string;
}

const mockEndpoints: ApiEndpoint[] = [
  {
    id: "get_projects",
    method: "GET",
    path: "/api/v1/projects",
    tag: "Projects",
    summary: "List all documentation projects",
    description: "Returns paginated list of active documentation workspaces.",
    parameters: [
      { name: "limit", in: "query", required: false, description: "Maximum records to return (default 20)" },
      { name: "offset", in: "query", required: false, description: "Pagination offset" },
    ],
    curlSnippet: 'curl -X GET "http://localhost:4007/api/v1/projects" \\\n  -H "Accept: application/json"',
  },
  {
    id: "create_page",
    method: "POST",
    path: "/api/v1/projects/{project_id}/pages",
    tag: "Pages",
    summary: "Create a new documentation page",
    description: "Compiles Markdown, validates links, and saves page to version tree.",
    parameters: [
      { name: "project_id", in: "path", required: true, description: "Project UUID or slug" },
    ],
    curlSnippet: 'curl -X POST "http://localhost:4007/api/v1/projects/pixlo-core/pages" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "version_id": "v2.0.0",\n    "slug": "getting-started",\n    "title": "Getting Started",\n    "raw_content": "# Intro"\n  }\'',
  },
  {
    id: "trigger_build",
    method: "POST",
    path: "/api/v1/projects/{project_id}/builds",
    tag: "Builds",
    summary: "Trigger static site generator build",
    description: "Runs SSG builder, builds search index, and audits dead links.",
    parameters: [
      { name: "project_id", in: "path", required: true, description: "Target project slug" },
    ],
    curlSnippet: 'curl -X POST "http://localhost:4007/api/v1/projects/pixlo-core/builds" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"trigger_type": "MANUAL"}\'',
  },
];

export default function ApiReferencePage({
  params,
}: {
  params: { project: string; version: string };
}) {
  const { project, version } = params;
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tags = ["ALL", "Projects", "Pages", "Builds"];

  const filtered = mockEndpoints.filter(
    (ep) => selectedTag === "ALL" || ep.tag === selectedTag
  );

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation
        projectSlug={project}
        projectName={project.replace(/-/g, " ").toUpperCase()}
        currentVersion={version}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 flex w-full gap-8">
        {/* Left Tag Navigator */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Filter by Tag
            </span>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedTag === tag
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Endpoints Section */}
        <main className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
              <Link href={`/docs/${project}/${version}/index`} className="hover:text-indigo-600">
                {project}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-mono">{version}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 font-semibold">API Reference</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              OpenAPI 3.x Reference Explorer
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Interactive endpoints, parameters, schema specifications, and runnable cURL commands.
            </p>
          </div>

          <div className="space-y-4">
            {filtered.map((ep) => (
              <div
                key={ep.id}
                id={ep.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md text-white ${
                        ep.method === "GET"
                          ? "bg-emerald-600"
                          : ep.method === "POST"
                          ? "bg-blue-600"
                          : ep.method === "PUT"
                          ? "bg-amber-600"
                          : "bg-rose-600"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-800">{ep.path}</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                    {ep.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{ep.summary}</p>

                {/* Parameters Table */}
                {ep.parameters.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Parameters
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 text-left">Parameter</th>
                            <th className="p-2.5 text-left">Location</th>
                            <th className="p-2.5 text-left">Required</th>
                            <th className="p-2.5 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {ep.parameters.map((p) => (
                            <tr key={p.name}>
                              <td className="p-2.5 font-mono font-bold">{p.name}</td>
                              <td className="p-2.5 font-mono text-slate-500">{p.in}</td>
                              <td className="p-2.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    p.required
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {p.required ? "Required" : "Optional"}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-600">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* cURL Snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Request Example
                    </span>
                    <button
                      onClick={() => copyToClipboard(ep.id, ep.curlSnippet)}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
                    >
                      {copiedId === ep.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy cURL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                    {ep.curlSnippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
