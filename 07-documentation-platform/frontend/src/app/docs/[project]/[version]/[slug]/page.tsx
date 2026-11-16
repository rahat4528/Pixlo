"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../../../../components/Navigation";
import { ChevronRight, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

interface PageProps {
  params: {
    project: string;
    version: string;
    slug: string;
  };
}

export default function DocReaderPage({ params }: PageProps) {
  const { project, version, slug } = params;

  // Mock document data for demonstration
  const docTitle = slug === "index" ? "Introduction & Overview" : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const isOutdated = version === "v1.0.0";
  const latestVersion = "v2.0.0";

  const navItems = [
    { title: "Introduction & Overview", slug: "index" },
    { title: "Prerequisites & Setup", slug: "prerequisites" },
    { title: "Architecture & Core Concepts", slug: "architecture" },
    { title: "Inverted Index Configuration", slug: "search-indexer" },
    { title: "Deployment & Production", slug: "deployment" },
  ];

  const tocItems = [
    { id: "overview", title: "System Overview" },
    { id: "key-components", title: "Key Components" },
    { id: "configuration", title: "Runtime Configuration" },
    { id: "next-steps", title: "Next Steps" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation
        projectSlug={project}
        projectName={project.replace(/-/g, " ").toUpperCase()}
        currentVersion={version}
      />

      {/* Outdated Version Banner */}
      {isOutdated && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs text-amber-800 flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>
            You are viewing an older documentation version ({version}).
          </span>
          <Link
            href={`/docs/${project}/${latestVersion}/${slug}`}
            className="font-bold underline hover:text-amber-950 ml-1"
          >
            Switch to latest stable release ({latestVersion}) &rarr;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 flex w-full">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 pr-8 hidden md:block border-r border-slate-200">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Getting Started
              </h3>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${project}/${version}/${item.slug}`}
                    className={`block px-3 py-2 text-xs rounded-lg transition ${
                      item.slug === slug
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 md:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-indigo-600">
              Docs
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono">{version}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">{docTitle}</span>
          </div>

          <article className="prose max-w-none">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              {docTitle}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              This guide explains the architecture, operational workflow, and configuration options for <strong>{project}</strong>.
            </p>

            <div className="doc-callout-tip">
              <div className="font-bold text-xs uppercase tracking-wider mb-1">Architecture Tip</div>
              <p className="text-xs leading-relaxed">
                Always configure caching and reverse proxy headers before deploying services into high-volume production clusters.
              </p>
            </div>

            <h2 id="overview" className="text-xl font-bold text-slate-900 mt-8 mb-3">
              System Overview
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              The documentation platform operates with zero external dependencies, leveraging a pure Python static generator and Jinja2 templating to guarantee deterministic builds.
            </p>

            <div className="doc-callout-note">
              <div className="font-bold text-xs uppercase tracking-wider mb-1">Note</div>
              <p className="text-xs leading-relaxed">
                All internal hyperlinks and anchor tags are strictly validated during compile time. Broken targets abort production deployments automatically.
              </p>
            </div>

            <h2 id="key-components" className="text-xl font-bold text-slate-900 mt-8 mb-3">
              Key Components
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 mb-6">
              <li><strong>Markdown Parser:</strong> Extracts YAML frontmatter, custom admonitions, and hierarchical TOC trees.</li>
              <li><strong>Version Manager:</strong> Semantic versioning with alias routing and outdated banners.</li>
              <li><strong>OpenAPI Parser:</strong> Interactive parameter exploration and runnable cURL snippets.</li>
              <li><strong>Link Validator:</strong> Graph-based cross-reference auditor preventing 404 links.</li>
            </ul>

            <h2 id="configuration" className="text-xl font-bold text-slate-900 mt-8 mb-3">
              Runtime Configuration
            </h2>
            <pre>
              <code>{`# Environment settings
PORT=4007
DATABASE_URL=postgresql://pixlo_docs_user:pixlo_docs_password@localhost:5437/pixlo_docs_db
REDIS_URL=redis://localhost:6387/0
BUILD_OUTPUT_DIR=./dist`}</code>
            </pre>
          </article>

          {/* Next / Prev Links */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
            <Link
              href={`/docs/${project}/${version}/prerequisites`}
              className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Prerequisites</span>
            </Link>
            <Link
              href={`/docs/${project}/${version}/architecture`}
              className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 font-medium"
            >
              <span>Architecture</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>

        {/* Right Table of Contents (TOC) */}
        <aside className="w-56 flex-shrink-0 pl-6 hidden lg:block border-l border-slate-200">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              On this page
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="hover:text-indigo-600 transition block truncate"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
