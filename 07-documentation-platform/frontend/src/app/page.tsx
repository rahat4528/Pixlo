"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { BookOpen, ArrowRight, Layers, FileCode, CheckCircle2, Search, ExternalLink } from "lucide-react";

interface ProjectCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  defaultVersion: string;
  totalPages: number;
  lastBuilt: string;
  hasApiSpec: boolean;
}

const mockProjects: ProjectCard[] = [
  {
    id: "proj-1",
    name: "Pixlo Core Engine",
    slug: "pixlo-core",
    description: "Distributed content ingestion, full-text inverted indexing, and storage pipelines.",
    defaultVersion: "v2.0.0",
    totalPages: 24,
    lastBuilt: "2026-11-16 11:20",
    hasApiSpec: true,
  },
  {
    id: "proj-2",
    name: "Knowledge Graph SDK",
    slug: "graph-sdk",
    description: "Bidirectional backlink traversal, cycle detection, and ontology modeling libraries.",
    defaultVersion: "v1.4.0",
    totalPages: 16,
    lastBuilt: "2026-11-16 09:45",
    hasApiSpec: true,
  },
  {
    id: "proj-3",
    name: "Edge Delivery Network",
    slug: "edge-delivery",
    description: "Caching proxies, stale-while-revalidate headers, and SSL termination gateways.",
    defaultVersion: "v1.0.0",
    totalPages: 11,
    lastBuilt: "2026-11-15 18:10",
    hasApiSpec: false,
  },
];

export default function HomePage() {
  const [projects] = useState<ProjectCard[]>(mockProjects);
  const [searchFilter, setSearchFilter] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/30">
            <span>Documentation Hub</span>
            <span>&bull;</span>
            <span>Versioned Static Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Developer Documentation &amp; API References
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Multi-version documentation platform powered by a custom static generator, live OpenAPI 3.x ingestion, automated broken link auditing, and full-text inverted search.
          </p>

          {/* Quick Search */}
          <div className="max-w-xl mx-auto mt-6">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter documentation projects or guides..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Documented Projects</h2>
            <p className="text-slate-600 text-xs mt-1">
              Select a project to browse guides, architecture specifications, and API documentation.
            </p>
          </div>
          <Link
            href="/builds"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All Build Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                    {proj.defaultVersion}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {proj.name}
                </h3>
                <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.totalPages} pages</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Audited clean</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Link
                    href={`/docs/${proj.slug}/${proj.defaultVersion}/index`}
                    className="flex-1 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold text-center transition shadow-sm"
                  >
                    Open Docs
                  </Link>
                  {proj.hasApiSpec && (
                    <Link
                      href={`/docs/${proj.slug}/${proj.defaultVersion}/api-reference`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      title="API Reference"
                    >
                      API
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
