'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, FileText, History, Link as LinkIcon, Plus, Edit3, ArrowLeft, GitCompare, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TreeNode {
  id: string;
  title: string;
  slug: string;
  children?: TreeNode[];
}

export default function SpaceViewPage({ params }: { params: { slug: string } }) {
  const [activeSlug, setActiveSlug] = useState('engineering-handbook');
  const [showDiffModal, setShowDiffModal] = useState(false);

  const tree: TreeNode[] = [
    {
      id: 'p-1',
      title: 'Engineering Standards & Handbook',
      slug: 'engineering-handbook',
      children: [
        { id: 'p-2', title: 'Distributed Systems Standards', slug: 'distributed-systems' },
        { id: 'p-3', title: 'Database Isolation Principles', slug: 'database-migrations' },
      ],
    },
    {
      id: 'p-4',
      title: 'Incident Postmortems & Runbooks',
      slug: 'incident-runbooks',
      children: [
        { id: 'p-5', title: 'Queue Backpressure Mitigations', slug: 'queue-backpressure' },
      ],
    },
  ];

  const pagesContent: Record<string, any> = {
    'engineering-handbook': {
      title: 'Engineering Standards & Handbook',
      status: 'PUBLISHED',
      author: 'Elena Architect',
      currentRevision: 2,
      lastUpdated: '10 mins ago',
      content: `### Executive Architectural Governance

Welcome to the internal engineering handbook. All microservices and autonomous modules in Pixlo operate under strict domain isolation boundaries.

#### Mandated Engineering Rules
1. **No Shared Relational Databases**: Each service maintains exclusive ownership over its schema. Cross-database queries or foreign keys are forbidden.
2. **Event-Driven Resilience**: Asynchronous communications must tolerate worker restarts through transactional outbox or persistent queuing.
3. **Optimistic Concurrency**: Collaborative resource updates must enforce revision checks.

#### Key Architectural Standards
- [[distributed-systems|Distributed Systems Standards]] — Idempotent consumer loops and token bucket rate limiters.
- [[database-migrations|Database Isolation Principles]] — Independent migration lifecycles and zero downtime constraints.
- [[queue-backpressure|Queue Backpressure Mitigations]] — Dead-letter replay patterns.`,
      inboundBacklinks: [
        { title: 'Distributed Systems Standards', slug: 'distributed-systems', linkLabel: 'Engineering Handbook' },
        { title: 'Database Isolation Principles', slug: 'database-migrations', linkLabel: 'Engineering Handbook' },
      ],
      revisions: [
        { revision: 2, author: 'Elena Architect', time: '10 mins ago', summary: 'Added optimistic concurrency guidelines' },
        { revision: 1, author: 'Elena Architect', time: 'Yesterday', summary: 'Initial handbook draft' },
      ],
    },
    'distributed-systems': {
      title: 'Distributed Systems Standards',
      status: 'PUBLISHED',
      author: 'Elena Architect',
      currentRevision: 1,
      lastUpdated: '15 mins ago',
      content: `### Distributed Systems Specifications

When scaling background pipelines across independent processes, engineers must implement bounded queues and exponential retry backoff.

#### Required Implementations
- **Idempotency Keys**: Requests carrying client operation tokens must be deduplicated within a 24-hour Redis TTL window.
- **Circuit Breakers**: External HTTP calls must monitor error rates and fast-fail upon continuous timeouts.

Refer back to [[engineering-handbook|Engineering Standards Handbook]] for base standards.`,
      inboundBacklinks: [
        { title: 'Engineering Standards Handbook', slug: 'engineering-handbook', linkLabel: 'Distributed Systems Standards' },
      ],
      revisions: [
        { revision: 1, author: 'Elena Architect', time: '15 mins ago', summary: 'Initial distributed standards RFC' },
      ],
    },
    'database-migrations': {
      title: 'Database Isolation Principles',
      status: 'PUBLISHED',
      author: 'Elena Architect',
      currentRevision: 1,
      lastUpdated: '1 hour ago',
      content: `### Database Isolation & Migration Lifecycle

Every application connects only to its dedicated PostgreSQL database on isolated ports.

#### Database Allocations
- Blog Platform: \`pixlo_blog_db\` (Port 5431)
- Recipe Sharing: \`pixlo_recipes_db\` (Port 5432)
- News Aggregator: \`pixlo_news_db\` (Port 5433)
- Note-Taking App: \`pixlo_notes_db\` (Port 5434)
- Newsletter Platform: \`pixlo_newsletter_db\` (Port 5435)
- Wiki System: \`pixlo_wiki_db\` (Port 5436)

Governed by [[engineering-handbook|Engineering Handbook]].`,
      inboundBacklinks: [
        { title: 'Engineering Standards Handbook', slug: 'engineering-handbook', linkLabel: 'Database Isolation Principles' },
      ],
      revisions: [
        { revision: 1, author: 'Elena Architect', time: '1 hour ago', summary: 'Initial database port matrix' },
      ],
    },
  };

  const currentPage = pagesContent[activeSlug] || pagesContent['engineering-handbook'];

  // Replace [[slug|label]] with interactive clickable links
  const renderContentWithWikiLinks = (text: string) => {
    const parts = text.split(/(\[\[[a-zA-Z0-9_\-]+(?:\|[^\]]+)?\]\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[\[([a-zA-Z0-9_\-]+)(?:\|([^\]]+))?\]\]/);
      if (match) {
        const targetSlug = match[1];
        const label = match[2] || targetSlug;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSlug(targetSlug)}
            className="text-blue-600 hover:text-blue-800 underline font-semibold px-1 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition inline-flex items-center space-x-1"
          >
            <span>{label}</span>
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Left Sidebar: Hierarchical Tree Navigation */}
        <aside className="w-full md:w-64 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Engineering Wiki</h2>
              <span className="text-[11px] text-slate-500">Space: {params.slug}</span>
            </div>
            <Link
              href={`/spaces/${params.slug}/new`}
              className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              title="Add page"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          <nav className="space-y-1 text-xs">
            {tree.map((node) => (
              <div key={node.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveSlug(node.slug)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg font-medium transition text-left ${
                    activeSlug === node.slug
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{node.title}</span>
                </button>

                {node.children && (
                  <div className="pl-4 space-y-1 border-l border-slate-200 ml-3">
                    {node.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setActiveSlug(child.slug)}
                        className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-left transition ${
                          activeSlug === child.slug
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1 flex-shrink-0"></span>
                        <span className="truncate">{child.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Central Pane: Document Viewer */}
        <main className="flex-1 bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6 min-w-0">
          {/* Page Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.title}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentPage.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Revision #{currentPage.currentRevision} &bull; Updated {currentPage.lastUpdated} by {currentPage.author}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowDiffModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Revisions</span>
              </button>

              <Link
                href={`/spaces/${params.slug}/new?edit=${activeSlug}`}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Page</span>
              </Link>
            </div>
          </div>

          {/* Rendered Body */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {renderContentWithWikiLinks(currentPage.content)}
          </div>

          {/* Bi-directional Backlinks Section */}
          <div className="border-t border-slate-200 pt-6 mt-8 space-y-3">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Pages Linking Here ({currentPage.inboundBacklinks?.length || 0})
              </h3>
            </div>
            {currentPage.inboundBacklinks && currentPage.inboundBacklinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentPage.inboundBacklinks.map((bl: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlug(bl.slug)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 text-xs font-medium text-slate-700 transition"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>{bl.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No other documents link to this page yet.</p>
            )}
          </div>
        </main>
      </div>

      {/* Revision Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Unified Revision Diff: Rev #1 ➔ Rev #2</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center space-x-4 text-xs font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-emerald-700 font-semibold">+ 3 additions</span>
              <span className="text-rose-700 font-semibold">- 1 deletions</span>
              <span className="text-slate-500">Computed via Python standard difflib engine</span>
            </div>

            <div className="font-mono text-xs bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto space-y-1">
              <div className="text-slate-400">--- Previous Revision (Rev #1)</div>
              <div className="text-slate-400">+++ Current Revision (Rev #2)</div>
              <div className="text-blue-400">@@ -3,3 +3,5 @@</div>
              <div className="text-slate-300"> 1. No Shared Relational Databases: Each service owns its schema.</div>
              <div className="text-rose-400 bg-rose-950/40 px-1 rounded">- 2. Event-Driven Messaging without persistence.</div>
              <div className="text-emerald-400 bg-emerald-950/40 px-1 rounded">+ 2. Event-Driven Resilience: Asynchronous queues with persistent outbox.</div>
              <div className="text-emerald-400 bg-emerald-950/40 px-1 rounded">+ 3. Optimistic Concurrency: Collaborative updates must enforce revision checks.</div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">Need to revert? You can restore Revision #1 anytime.</span>
              <button
                type="button"
                onClick={() => {
                  alert('Rolled back to Revision #1 successfully!');
                  setShowDiffModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition"
              >
                Restore Revision #1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
