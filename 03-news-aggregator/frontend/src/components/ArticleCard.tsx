'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ExternalLink, Flame, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    canonicalUrl: string;
    originalUrl: string;
    publishedAt: string | Date;
    authorName?: string;
    imageUrl?: string;
    category: string;
    isBreaking?: boolean;
    isSaved?: boolean;
    source: {
      name: string;
      slug: string;
      logoUrl?: string;
      websiteUrl: string;
    };
  };
  onToggleSave?: (articleId: string) => void;
}

export function ArticleCard({ article, onToggleSave }: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(article.isSaved || false);

  const publishedDate = new Date(article.publishedAt);
  const timeAgo = !isNaN(publishedDate.getTime())
    ? formatDistanceToNow(publishedDate, { addSuffix: true })
    : 'recently';

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    if (onToggleSave) {
      onToggleSave(article.id);
    }
  };

  return (
    <article className="bg-white border border-news-border rounded-xl p-5 shadow-sm hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Source Header */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <Link
            href={`/source/${article.source.slug}`}
            className="flex items-center space-x-2 group"
          >
            {article.source.logoUrl ? (
              <img
                src={article.source.logoUrl}
                alt={article.source.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                {article.source.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-news-ink group-hover:text-news-accent transition-colors">
              {article.source.name}
            </span>
          </Link>
          <div className="flex items-center space-x-2 text-news-muted">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </span>
            <button
              onClick={handleSaveClick}
              className={`p-1 rounded hover:bg-slate-100 transition ${
                isSaved ? 'text-news-accent' : 'text-slate-400'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Article'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-news-accent' : ''}`} />
            </button>
          </div>
        </div>

        {/* Headline */}
        <Link href={`/reader/${article.id}`} className="group block mb-2">
          {article.isBreaking && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 mr-2">
              <Flame className="w-3 h-3 text-red-600" />
              <span>BREAKING</span>
            </span>
          )}
          <h2 className="font-headline font-bold text-lg text-news-ink leading-snug group-hover:text-news-accent transition-colors">
            {article.title}
          </h2>
        </Link>

        {/* Short excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {article.excerpt}
        </p>
      </div>

      {/* Card Footer: Category, Author & Original Publisher Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Link
            href={`/category/${article.category.toLowerCase()}`}
            className="uppercase font-bold text-[10px] tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
          >
            {article.category}
          </Link>
          {article.authorName && (
            <span className="text-news-muted truncate max-w-[120px]">
              By {article.authorName}
            </span>
          )}
        </div>

        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 font-semibold text-news-blue hover:text-blue-800 transition"
          title="Visit original article at publisher website"
        >
          <span>Original</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}
