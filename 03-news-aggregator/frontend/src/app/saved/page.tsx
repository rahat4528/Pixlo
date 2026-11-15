'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SavedArticlesPage() {
  const [savedItems, setSavedItems] = useState<any[]>([
    {
      id: 'save-1',
      savedAt: new Date(),
      notes: 'Essential benchmark figures for grid battery performance analysis.',
      article: {
        id: 'art-battery-1',
        title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
        excerpt:
          'Researchers at the Materials Innovation Consortium have concluded a six-month grid-scale test of high-density solid-state sodium cells.',
        canonicalUrl:
          'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
        originalUrl:
          'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
        publishedAt: new Date(Date.now() - 3600000 * 4),
        category: 'science',
        source: {
          name: 'Quantum Science Review',
          slug: 'quantum-science-review',
        },
      },
    },
  ]);

  useEffect(() => {
    fetch('http://localhost:4003/api/articles/saved')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSavedItems(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleRemove = (id: string) => {
    setSavedItems(savedItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-xs text-news-muted">
        <Link href="/" className="hover:text-news-ink flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="font-medium text-news-ink">Saved Articles</span>
      </div>

      <div className="border-b border-news-border pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-news-accent mb-1">
            <Bookmark className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Reading List</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-news-ink">
            Saved Articles & References
          </h1>
        </div>
        <span className="text-xs font-semibold text-news-muted bg-white border border-news-border px-3 py-1 rounded-full">
          {savedItems.length} Bookmarks
        </span>
      </div>

      {savedItems.length > 0 ? (
        <div className="space-y-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-news-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2 text-xs text-news-muted">
                  <span className="font-bold text-slate-800">{item.article.source.name}</span>
                  <span>•</span>
                  <span>
                    Saved{' '}
                    {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                  </span>
                </div>
                <Link
                  href={`/reader/${item.article.id}`}
                  className="font-headline font-bold text-lg text-news-ink hover:text-news-accent transition block"
                >
                  {item.article.title}
                </Link>
                {item.notes && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-100 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs shrink-0">
                <a
                  href={item.article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-news-border hover:bg-slate-50 font-semibold text-news-blue flex items-center space-x-1"
                >
                  <span>Publisher</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-news-border rounded-xl p-12 text-center text-sm text-news-muted">
          Your reading list is currently empty. Click the bookmark icon on any article to save it for later.
        </div>
      )}
    </div>
  );
}
