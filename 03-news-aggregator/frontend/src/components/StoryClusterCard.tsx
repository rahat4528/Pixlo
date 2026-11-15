'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Flame, ExternalLink, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ClusterArticle {
  id: string;
  title: string;
  originalUrl: string;
  source: {
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface StoryClusterProps {
  cluster: {
    id: string;
    title: string;
    category: string;
    isBreaking: boolean;
    articleCount: number;
    lastPublishedAt: string | Date;
    articles?: ClusterArticle[];
  };
}

export function StoryClusterCard({ cluster }: StoryClusterProps) {
  const publishedDate = new Date(cluster.lastPublishedAt);
  const timeAgo = !isNaN(publishedDate.getTime())
    ? formatDistanceToNow(publishedDate, { addSuffix: true })
    : 'recently';

  return (
    <div className="bg-white border border-news-border rounded-xl p-5 shadow-sm hover:border-slate-400 transition-all">
      {/* Header tags */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          {cluster.isBreaking && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
              <Flame className="w-3 h-3 text-red-600" />
              <span>BREAKING COVERAGE</span>
            </span>
          )}
          <span className="uppercase text-[11px] font-bold tracking-wider text-news-muted bg-slate-100 px-2 py-0.5 rounded">
            {cluster.category}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-news-muted">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-blue-600">{cluster.articleCount} sources</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Cluster Main Headline */}
      <Link href={`/cluster/${cluster.id}`} className="group block">
        <h3 className="font-headline font-bold text-lg sm:text-xl text-news-ink leading-snug group-hover:text-news-accent transition-colors">
          {cluster.title}
        </h3>
      </Link>

      {/* Covering Sources Sub-list */}
      {cluster.articles && cluster.articles.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <p className="text-xs font-semibold text-news-muted uppercase tracking-wider">
            Multi-Source Publisher Perspectives:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cluster.articles.map((art) => (
              <div
                key={art.id}
                className="flex items-start justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
              >
                <div className="pr-2">
                  <span className="font-bold text-slate-800">{art.source.name}: </span>
                  <Link
                    href={`/reader/${art.id}`}
                    className="text-slate-600 hover:text-news-accent line-clamp-1"
                  >
                    {art.title}
                  </Link>
                </div>
                <a
                  href={art.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-news-ink mt-0.5 shrink-0"
                  title="Read on original publisher"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <Link
          href={`/cluster/${cluster.id}`}
          className="text-news-accent font-semibold flex items-center space-x-1 hover:underline"
        >
          <span>Compare full publisher coverage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
