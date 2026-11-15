'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Layers, Radio, TrendingUp, ShieldCheck, ExternalLink } from 'lucide-react';
import { StoryClusterCard } from '../components/StoryClusterCard';
import { ArticleCard } from '../components/ArticleCard';

const INITIAL_CLUSTERS = [
  {
    id: 'cluster-battery-1',
    title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
    category: 'science',
    isBreaking: true,
    articleCount: 2,
    lastPublishedAt: new Date(Date.now() - 3600000 * 2),
    articles: [
      {
        id: 'art-battery-1',
        title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
        originalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
        source: {
          name: 'Quantum Science Review',
          slug: 'quantum-science-review',
          logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=64&h=64&fit=crop',
        },
      },
      {
        id: 'art-battery-2',
        title: 'How Sodium Solid-State Batteries Could Disrupt Lithium Infrastructure This Decade',
        originalUrl: 'https://techhorizon.io/hardware/sodium-solid-state-batteries-analysis',
        source: {
          name: 'Tech Horizon',
          slug: 'tech-horizon',
          logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=64&h=64&fit=crop',
        },
      },
    ],
  },
];

const INITIAL_ARTICLES = [
  {
    id: 'art-battery-1',
    title: 'Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage',
    excerpt: 'Researchers at the Materials Innovation Consortium have concluded a six-month grid-scale test of high-density solid-state sodium cells, revealing sustained 94% Coulombic efficiency across 1,200 continuous thermal cycles.',
    canonicalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
    originalUrl: 'https://quantumsciencereview.net/articles/solid-state-sodium-battery-pilot-2026',
    publishedAt: new Date(Date.now() - 3600000 * 4),
    authorName: 'Dr. Elena Rostova',
    category: 'science',
    isBreaking: true,
    source: {
      name: 'Quantum Science Review',
      slug: 'quantum-science-review',
      websiteUrl: 'https://quantumsciencereview.net',
      logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=64&h=64&fit=crop',
    },
  },
  {
    id: 'art-tech-1',
    title: 'Microkernel Architecture Gaining Adoption in Edge Cloud Workloads',
    excerpt: 'Hyperscale providers are experimenting with capability-based microkernels for serverless tasks, cutting cold boot latencies to sub-millisecond ranges while enforcing hardware-enforced memory safety isolation.',
    canonicalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
    originalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
    publishedAt: new Date(Date.now() - 3600000 * 8),
    authorName: 'Marcus Aurelius Sterling',
    category: 'technology',
    source: {
      name: 'Tech Horizon',
      slug: 'tech-horizon',
      websiteUrl: 'https://techhorizon.io',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=64&h=64&fit=crop',
    },
  },
  {
    id: 'art-market-1',
    title: 'Central Banks Signal Coordinated Liquidity Framework for Digital Currencies',
    excerpt: 'A cross-border coalition of monetary authorities published a joint protocol draft establishing real-time clearing standards for institutional tokenized settlement systems and sovereign digital reserves.',
    canonicalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework',
    originalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework',
    publishedAt: new Date(Date.now() - 3600000 * 12),
    authorName: 'Clarissa Montgomery',
    category: 'business',
    source: {
      name: 'Market Pulse Daily',
      slug: 'market-pulse-daily',
      websiteUrl: 'https://marketpulse.news',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=64&h=64&fit=crop',
    },
  },
  {
    id: 'art-world-1',
    title: 'International Seabed Assembly Ratifies Marine Environmental Protection Accord',
    excerpt: 'Delegates from 140 nations ratified an unprecedented environmental code governing exploratory extraction in international waters, creating binding buffer zones around hydrothermal vents and abyssal plains.',
    canonicalUrl: 'https://globalchronicle.org/diplomacy/seabed-environmental-treaty-signed',
    originalUrl: 'https://globalchronicle.org/diplomacy/seabed-environmental-treaty-signed',
    publishedAt: new Date(Date.now() - 3600000 * 16),
    authorName: 'Henrik Lindqvist',
    category: 'world',
    source: {
      name: 'Global Chronicle',
      slug: 'global-chronicle',
      websiteUrl: 'https://globalchronicle.org',
      logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=64&h=64&fit=crop',
    },
  },
];

const TRENDING_TOPICS = [
  { name: 'Artificial Intelligence', count: 18 },
  { name: 'Renewable Energy', count: 14 },
  { name: 'Space Exploration', count: 9 },
  { name: 'Central Bank Reserves', count: 8 },
  { name: 'Quantum Optics', count: 6 },
];

export default function NewsroomFrontPage() {
  const [clusters, setClusters] = useState(INITIAL_CLUSTERS);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    // Attempt live backend fetch if running
    fetch('http://localhost:4003/api/articles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.data && data.data.length > 0) {
          setArticles(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:4003/api/clusters')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setClusters(data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredArticles =
    selectedFilter === 'ALL'
      ? articles
      : selectedFilter === 'BREAKING'
      ? articles.filter((a) => a.isBreaking)
      : articles.filter((a) => a.category.toUpperCase() === selectedFilter);

  return (
    <div className="space-y-8">
      {/* Breaking News Ticker */}
      <div className="bg-red-50 border-l-4 border-red-600 p-3.5 rounded-r-lg flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase text-[10px] tracking-wider flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Breaking Report</span>
          </span>
          <span className="font-semibold text-red-950">
            Solid-State Sodium Battery Pilot Demonstrates 80% Cost Reduction for Grid Storage
          </span>
        </div>
        <Link
          href="/cluster/cluster-battery-1"
          className="text-red-700 hover:text-red-900 font-bold underline flex items-center space-x-1"
        >
          <span>View 2 Sources Coverage</span>
          <Layers className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Grid: Left 8 cols (Stories & Clusters) | Right 4 cols (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Multi-Source Story Clusters Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-news-border pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h2 className="font-headline font-black text-xl text-news-ink uppercase tracking-wide">
                  Developing Story Clusters
                </h2>
              </div>
              <span className="text-xs text-news-muted">
                Grouped coverage across verified publishers
              </span>
            </div>

            <div className="space-y-4">
              {clusters.map((cluster) => (
                <StoryClusterCard key={cluster.id} cluster={cluster} />
              ))}
            </div>
          </section>

          {/* Syndicated Headlines Feed */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-news-border pb-2 gap-2">
              <h2 className="font-headline font-black text-xl text-news-ink uppercase tracking-wide">
                Latest Syndicated News
              </h2>
              <div className="flex items-center space-x-1 text-xs">
                {['ALL', 'BREAKING', 'TECHNOLOGY', 'BUSINESS', 'SCIENCE', 'WORLD'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-2.5 py-1 rounded font-semibold transition ${
                      selectedFilter === f
                        ? 'bg-news-ink text-white'
                        : 'text-news-muted hover:text-news-ink hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Trending Topics, Publisher Registry & Syndication Principles */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Trending Topics Widget */}
          <div className="bg-white border border-news-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-news-ink border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-news-accent" />
              <h3 className="font-bold text-sm uppercase tracking-wide">Trending Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {TRENDING_TOPICS.map((topic) => (
                <span
                  key={topic.name}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-full cursor-pointer transition"
                >
                  <span>#{topic.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold">({topic.count})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Syndicated Sources Directory */}
          <div className="bg-white border border-news-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-news-ink uppercase tracking-wide">
                Configured Publishers
              </h3>
              <Link href="/admin/ingestion" className="text-xs text-news-blue hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Tech Horizon', category: 'Technology', status: 'ACTIVE', articles: 12 },
                { name: 'Global Chronicle', category: 'World', status: 'ACTIVE', articles: 18 },
                { name: 'Market Pulse Daily', category: 'Business', status: 'ACTIVE', articles: 9 },
                { name: 'Quantum Science Review', category: 'Science', status: 'ACTIVE', articles: 15 },
              ].map((src) => (
                <div key={src.name} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{src.name}</span>
                    <span className="text-slate-500 text-[11px]">{src.category} • {src.articles} stories</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Syndication Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Syndication Standards</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              Pixlo respects original journalism. Our engine stores only headlines, metadata, and
              concise excerpts. Full stories must be read directly at the publisher's publication site.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
