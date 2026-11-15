'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Sliders, Sparkles, Check } from 'lucide-react';
import { ArticleCard } from '../../components/ArticleCard';

const ALL_CATEGORIES = ['technology', 'business', 'science', 'world', 'local', 'sports'];

export default function PersonalizedFeedPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'technology',
    'business',
    'science',
  ]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4003/api/personalization/feed')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          // Fallback demo items
          setArticles([
            {
              id: 'feed-1',
              title: 'Microkernel Architecture Gaining Adoption in Edge Cloud Workloads',
              excerpt: 'Hyperscale providers are experimenting with capability-based microkernels for serverless tasks.',
              canonicalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
              originalUrl: 'https://techhorizon.io/architecture/microkernel-edge-cloud-shift',
              publishedAt: new Date(Date.now() - 3600000 * 3),
              category: 'technology',
              feedScore: 78.4,
              source: {
                name: 'Tech Horizon',
                slug: 'tech-horizon',
                websiteUrl: 'https://techhorizon.io',
              },
            },
            {
              id: 'feed-2',
              title: 'Central Banks Signal Coordinated Liquidity Framework for Digital Currencies',
              excerpt: 'A cross-border coalition of monetary authorities published a joint protocol draft establishing real-time clearing standards.',
              canonicalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework',
              originalUrl: 'https://marketpulse.news/policy/central-banks-digital-liquidity-framework',
              publishedAt: new Date(Date.now() - 3600000 * 5),
              category: 'business',
              feedScore: 65.2,
              source: {
                name: 'Market Pulse Daily',
                slug: 'market-pulse-daily',
                websiteUrl: 'https://marketpulse.news',
              },
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="border-b border-news-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-news-accent mb-1">
            <Compass className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Smart News Desk</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-news-ink">
            Your Personalized Feed
          </h1>
          <p className="text-xs sm:text-sm text-news-muted mt-1">
            Ranked by your followed publishers, preferred categories, and real-time interest weighting.
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-2 px-4 py-2 border border-news-border rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-news-muted" />
          <span>{showConfig ? 'Close Preferences' : 'Tune Preferences'}</span>
        </button>
      </div>

      {/* Preferences Tuning Panel */}
      {showConfig && (
        <div className="bg-white border border-news-border rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-sm text-news-ink uppercase tracking-wide">
            Preferred Category Weights
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    active
                      ? 'bg-news-ink text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="capitalize">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <div key={article.id} className="relative">
            {article.feedScore && (
              <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Match {Math.round(article.feedScore)}%</span>
              </span>
            )}
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
