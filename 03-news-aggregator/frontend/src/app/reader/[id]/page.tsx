'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  Share2,
  Clock,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CompactReaderPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<any>({
    id,
    title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
    excerpt:
      'Researchers at the Materials Innovation Consortium have concluded a six-month grid-scale test of high-density solid-state sodium cells, revealing sustained 94% Coulombic efficiency across 1,200 continuous thermal cycles.',
    canonicalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
    originalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
    publishedAt: new Date(),
    authorName: 'Dr. Elena Rostova',
    category: 'science',
    isBreaking: true,
    source: {
      name: 'Quantum Science Review',
      slug: 'quantum-science-review',
      websiteUrl: 'https://quantumsciencereview.net',
    },
    cluster: {
      id: 'cluster-1',
      title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
      articleCount: 2,
    },
  });

  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4003/api/articles/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setArticle(data);
          setIsSaved(data.isSaved || false);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back button & Reader Header Controls */}
      <div className="flex items-center justify-between text-xs text-news-muted border-b border-news-border pb-3">
        <Link href="/" className="hover:text-news-ink flex items-center space-x-1.5 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Front Page</span>
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isSaved
                ? 'bg-red-50 border-red-200 text-news-accent'
                : 'border-news-border bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-news-accent' : ''}`} />
            <span>{isSaved ? 'Saved to Bookmarks' : 'Save'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-news-border bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Article Content Container */}
      <div className="bg-white border border-news-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* Source & Timestamp */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <Link
            href={`/source/${article.source?.slug}`}
            className="font-bold text-news-ink hover:text-news-accent flex items-center space-x-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-news-accent inline-block" />
            <span>{article.source?.name}</span>
          </Link>
          <div className="flex items-center space-x-1 text-news-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-headline font-black text-2xl sm:text-4xl text-news-ink leading-tight">
          {article.title}
        </h1>

        {/* Byline / Author */}
        {article.authorName && (
          <p className="text-xs sm:text-sm text-news-muted font-medium border-b border-slate-100 pb-4">
            Reported by <span className="text-slate-800 font-semibold">{article.authorName}</span>
          </p>
        )}

        {/* Permitted Excerpt Content */}
        <div className="text-base sm:text-lg text-slate-700 leading-relaxed space-y-4">
          <p>{article.excerpt}</p>
        </div>

        {/* Primary Call to Action: Visit Original Publisher */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Full Reporting Available at Original Publisher</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Pixlo is an aggregator committed to fair attribution. We do not reproduce full
              articles. To read the complete investigative reporting, data tables, and analysis,
              please visit <strong>{article.source?.name}</strong>.
            </p>
            <div>
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
              >
                <span>Read Full Coverage on {article.source?.name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Story Cluster Navigation */}
        {article.cluster && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-news-muted">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>This article is part of a multi-publisher developing story</span>
            </div>
            <Link
              href={`/cluster/${article.cluster.id}`}
              className="text-news-accent font-semibold hover:underline"
            >
              Compare other perspectives →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
