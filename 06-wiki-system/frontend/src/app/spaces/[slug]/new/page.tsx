'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Sparkles, Send, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export default function NewPageComposer({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('Initial draft composition');
  const [needsReview, setNeedsReview] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const insertWikiLink = (linkSlug: string, label?: string) => {
    const snippet = label ? `[[${linkSlug}|${label}]]` : `[[${linkSlug}]]`;
    setContent((prev) => `${prev} ${snippet}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;

    setSavedMessage(
      needsReview
        ? 'Draft submitted to the review queue for editor approval!'
        : 'Document published successfully with automated revision tracking!'
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href={`/spaces/${params.slug}`}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Wiki Document</h1>
            <p className="text-xs text-slate-500">Space: {params.slug}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{needsReview ? 'Submit for Review' : 'Publish Page'}</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rate Limiting Specifications"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Slug *</label>
            <input
              type="text"
              required
              placeholder="e.g. rate-limiting-specs"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Markdown Content</label>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-600">Quick Wiki Links:</span>
              <button
                type="button"
                onClick={() => insertWikiLink('distributed-systems', 'Distributed Systems')}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
              >
                + [[distributed-systems]]
              </button>
              <button
                type="button"
                onClick={() => insertWikiLink('database-migrations', 'Database Migrations')}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
              >
                + [[database-migrations]]
              </button>
            </div>
          </div>
          <textarea
            rows={14}
            required
            placeholder="Write markdown here... Use [[page-slug]] to automatically link to other documents."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 font-mono text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Change Summary (for revision history)</label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
          <input
            type="checkbox"
            id="reviewCheckbox"
            checked={needsReview}
            onChange={(e) => setNeedsReview(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="reviewCheckbox" className="text-xs text-slate-600">
            Submit for peer review before publishing (Approval workflow)
          </label>
        </div>
      </form>
    </div>
  );
}
