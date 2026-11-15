'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, Flame, ExternalLink, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StoryClusterDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [cluster, setCluster] = useState<any>({
    id,
    title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
    category: 'science',
    isBreaking: true,
    articleCount: 2,
    lastPublishedAt: new Date(),
    articles: [
      {
        id: 'art-battery-1',
        title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
        excerpt: 'Researchers at the Materials Innovation Consortium have concluded a six-month grid-scale test of high-density solid-state sodium cells, revealing sustained 94% Coulombic efficiency across 1,200 continuous thermal cycles.',
        canonicalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
        originalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
        publishedAt: new Date(Date.now() - 3600000 * 4),
        authorName: 'Dr. Elena Rostova',
        source: {
          name: 'Quantum Science Review',
          slug: 'quantum-science-review',
          websiteUrl: 'https://quantumsciencereview.net',
        },
      },
      {
        id: 'art-battery-2',
        title: 'How Sodium Solid-State Batteries Could Disrupt Lithium Infrastructure This Decade',
        excerpt: 'Industrial utilities are preparing pilot orders for sodium-based grid batteries following verified test benchmarks showing minimal degradation in sub-zero and extreme-heat environments without expensive cooling loops.',
        canonicalUrl: 'https://techhorizon.io/hardware/sodium-solid-state-batteries-analysis',
        originalUrl: 'https://techhorizon.io/hardware/sodium-solid-state-batteries-analysis',
        publishedAt: new Date(Date.now() - 3600000 * 2),
        authorName: 'Julian Vance',
        source: {
          name: 'Tech Horizon',
          slug: 'tech-horizon',
          websiteUrl: 'https://techhorizon.io',
        },
      },
    ],
  });

  useEffect(() => {
    fetch(`http://localhost:4003/api/clusters/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCluster(data);
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-xs text-news-muted">
        <Link href="/" className="hover:text-news-ink flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span>Story Clusters</span>
        <span>/</span>
        <span className="font-medium text-news-ink line-clamp-1">{cluster.title}</span>
      </div>

      {/* Cluster Masthead */}
      <div className="bg-white border border-news-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          {cluster.isBreaking && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>BREAKING NEWS CLUSTER</span>
            </span>
          )}
          <span className="uppercase text-xs font-bold tracking-wider text-news-muted bg-slate-100 px-2 py-0.5 rounded">
            {cluster.category}
          </span>
          <span className="text-xs text-blue-600 font-bold flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{cluster.articleCount || cluster.articles?.length} Independent Publishers</span>
          </span>
        </div>

        <h1 className="font-headline font-black text-2xl sm:text-4xl text-news-ink leading-tight">
          {cluster.title}
        </h1>

        <p className="text-xs sm:text-sm text-news-muted">
          Our real-time clustering engine has grouped related coverage from verified publishers.
          Compare perspectives and angles below.
        </p>
      </div>

      {/* Side-by-side or stacked multi-source coverage cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cluster.articles?.map((art: any, index: number) => (
          <div
            key={art.id}
            className="bg-white border border-news-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-400 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-news-ink flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span>{art.source.name}</span>
                </span>
                <span className="text-news-muted">
                  {formatDistanceToNow(new Date(art.publishedAt), { addSuffix: true })}
                </span>
              </div>

              <h2 className="font-headline font-bold text-lg text-news-ink leading-snug">
                {art.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/reader/${art.id}`}
                className="text-xs font-semibold text-news-ink hover:text-news-accent"
              >
                Open Reader View
              </Link>
              <a
                href={art.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-bold text-news-blue hover:text-blue-800"
              >
                <span>Read Full Coverage at {art.source.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
