'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Radio, CheckCircle, Rss, ExternalLink } from 'lucide-react';
import { ArticleCard } from '../../../components/ArticleCard';

export default function SourceProfilePage() {
  const params = useParams();
  const slug = (params.slug as string) || 'tech-horizon';

  const [source, setSource] = useState<any>({
    name: slug.replace(/-/g, ' ').toUpperCase(),
    slug,
    websiteUrl: 'https://example.com',
    description: 'Autonomous syndicated publisher supplying verified news feeds to Pixlo.',
    status: 'ACTIVE',
    category: 'technology',
  });
  const [articles, setArticles] = useState<any[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4003/api/sources/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSource(data);
          if (data.articles) setArticles(data.articles);
          setIsFollowed(data.isFollowed || false);
        }
      })
      .catch(() => {});
  }, [slug]);

  const toggleFollow = () => {
    setIsFollowed(!isFollowed);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-xs text-news-muted">
        <Link href="/" className="hover:text-news-ink flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span>Publishers</span>
        <span>/</span>
        <span className="font-medium text-news-ink">{source.name}</span>
      </div>

      {/* Publisher Header Banner */}
      <div className="bg-white border border-news-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-news-ink">
              {source.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{source.status}</span>
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {source.description}
          </p>
          <div className="flex items-center space-x-4 text-xs text-news-muted pt-2">
            <a
              href={source.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-news-blue"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{source.websiteUrl}</span>
            </a>
            <span className="flex items-center space-x-1 text-amber-600 font-medium">
              <Rss className="w-3.5 h-3.5" />
              <span>Syndication Feed Active</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFollow}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isFollowed
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-news-ink text-white hover:bg-slate-800 shadow-sm'
            }`}
          >
            {isFollowed ? 'Following Publisher' : '+ Follow Publisher'}
          </button>
          <a
            href={source.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-news-border rounded-lg hover:bg-slate-100 text-slate-600"
            title="Visit Publisher Website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Stories list */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-xl text-news-ink">
          Syndicated Stories from {source.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={{
                  ...article,
                  source: {
                    name: source.name,
                    slug: source.slug,
                    websiteUrl: source.websiteUrl,
                    logoUrl: source.logoUrl,
                  },
                }}
              />
            ))
          ) : (
            <div className="col-span-full bg-white border border-dashed border-news-border rounded-xl p-8 text-center text-sm text-news-muted">
              No recent syndicated stories found for this publisher.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
