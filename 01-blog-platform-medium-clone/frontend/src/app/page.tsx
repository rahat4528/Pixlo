'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Sparkles, TrendingUp, Heart, CheckCircle2 } from 'lucide-react';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  publication?: {
    name: string;
    slug: string;
  };
  category: string;
  publishedAt: string;
  readingTimeMinutes: number;
  applauseCount: number;
  isMembersOnly: boolean;
}

const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: '1',
    slug: 'architecting-resilient-distributed-systems',
    title: 'Architecting Resilient Distributed Systems for High-Throughput Workloads',
    excerpt: 'How to combine backpressure, circuit breakers, and stateful partitioned queues to withstand unpredictable traffic storms.',
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'Elena Rostova',
      username: 'elena_writes',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    },
    publication: {
      name: 'Architectural Horizons',
      slug: 'architectural-horizons',
    },
    category: 'Software Architecture',
    publishedAt: '2 days ago',
    readingTimeMinutes: 4,
    applauseCount: 88,
    isMembersOnly: false,
  },
  {
    id: '2',
    slug: 'advanced-raft-consensus-internals',
    title: 'Advanced Raft Consensus Internals: Log Compaction and Leader Leases',
    excerpt: 'An exclusive deep-dive into snapshot serialization, disk flush latency, and lease-based linearizable reads.',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'Elena Rostova',
      username: 'elena_writes',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    },
    publication: {
      name: 'Architectural Horizons',
      slug: 'architectural-horizons',
    },
    category: 'Software Architecture',
    publishedAt: 'Yesterday',
    readingTimeMinutes: 6,
    applauseCount: 42,
    isMembersOnly: true,
  },
  {
    id: '3',
    slug: 'typography-and-rhythm-editorial-interfaces',
    title: 'Typography and Rhythm: Building Editorial Interfaces with Variable Fonts',
    excerpt: 'Creating reading column harmony, dynamic optical sizing, and baseline grids for immersive long-form experiences.',
    coverImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
    author: {
      name: 'Marcus Chen',
      username: 'marcus_codes',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    },
    category: 'Frontend Craft',
    publishedAt: 'Today',
    readingTimeMinutes: 3,
    applauseCount: 29,
    isMembersOnly: false,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following' | 'trending'>('forYou');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['1']));

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Hero Banner */}
      <section className="mb-12 border-b border-gray-100 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                <Sparkles className="w-3 h-3 mr-1" /> Featured Publication
              </span>
              <span className="text-xs text-gray-500">In Architectural Horizons</span>
            </div>
            <Link href={`/story/${SAMPLE_ARTICLES[0].slug}`} className="group">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                {SAMPLE_ARTICLES[0].title}
              </h1>
              <p className="mt-3 text-lg text-gray-600 line-clamp-2 leading-relaxed">
                {SAMPLE_ARTICLES[0].excerpt}
              </p>
            </Link>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={SAMPLE_ARTICLES[0].author.avatarUrl}
                  alt={SAMPLE_ARTICLES[0].author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <Link href={`/author/${SAMPLE_ARTICLES[0].author.username}`} className="text-sm font-semibold text-gray-900 hover:underline">
                    {SAMPLE_ARTICLES[0].author.name}
                  </Link>
                  <p className="text-xs text-gray-500">{SAMPLE_ARTICLES[0].publishedAt} · {SAMPLE_ARTICLES[0].readingTimeMinutes} min read</p>
                </div>
              </div>
              <button
                onClick={(e) => toggleBookmark(SAMPLE_ARTICLES[0].id, e)}
                className={`p-2 rounded-full transition-colors ${
                  bookmarkedIds.has(SAMPLE_ARTICLES[0].id) ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Link href={`/story/${SAMPLE_ARTICLES[0].slug}`}>
              <img
                src={SAMPLE_ARTICLES[0].coverImageUrl}
                alt="Cover"
                className="w-full h-72 sm:h-80 object-cover rounded-xl shadow-sm hover:opacity-95 transition-opacity"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Feed */}
        <div className="lg:col-span-8">
          {/* Feed Tabs */}
          <div className="flex items-center space-x-6 border-b border-gray-100 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('forYou')}
              className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                activeTab === 'forYou' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              For you
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                activeTab === 'following' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`text-sm font-semibold pb-3 -mb-3 transition-colors ${
                activeTab === 'trending' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Trending
            </button>
          </div>

          {/* Article List */}
          <div className="divide-y divide-gray-100">
            {SAMPLE_ARTICLES.map((article) => (
              <article key={article.id} className="py-7 group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={article.author.avatarUrl}
                        alt={article.author.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <Link href={`/author/${article.author.username}`} className="text-xs font-medium text-gray-800 hover:underline">
                        {article.author.name}
                      </Link>
                      {article.publication && (
                        <>
                          <span className="text-xs text-gray-400">in</span>
                          <Link href={`/publication/${article.publication.slug}`} className="text-xs font-medium text-gray-800 hover:underline">
                            {article.publication.name}
                          </Link>
                        </>
                      )}
                      {article.isMembersOnly && (
                        <span className="ml-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          ★ Members Only
                        </span>
                      )}
                    </div>

                    <Link href={`/story/${article.slug}`}>
                      <h2 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {article.title}
                      </h2>
                      <p className="mt-1.5 text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </Link>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          {article.category}
                        </span>
                        <span>{article.readingTimeMinutes} min read</span>
                        <span>·</span>
                        <span>{article.publishedAt}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-gray-600">
                          👏 {article.applauseCount}
                        </span>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(article.id, e)}
                        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                          bookmarkedIds.has(article.id) ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/story/${article.slug}`} className="shrink-0">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="w-28 h-20 sm:w-36 sm:h-28 object-cover rounded-lg"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Staff Picks */}
          <div className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-sans font-bold text-sm tracking-wide uppercase text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Staff Selections
            </h3>
            <div className="space-y-4">
              {SAMPLE_ARTICLES.slice(0, 2).map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img src={item.author.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                    <span className="text-xs font-semibold text-gray-800">{item.author.name}</span>
                  </div>
                  <Link href={`/story/${item.slug}`} className="block text-sm font-semibold text-gray-900 hover:text-emerald-700 leading-snug">
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Topics */}
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide uppercase text-gray-900 mb-4">
              Explore Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Distributed Systems', 'Performance', 'TypeScript', 'Design Systems', 'Consensus Protocols', 'Microservices'].map((topic) => (
                <Link
                  key={topic}
                  href={`/?tag=${topic.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Writers */}
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide uppercase text-gray-900 mb-4">
              Authors to Follow
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                    alt="Elena"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Elena Rostova</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">Principal Systems Architect</p>
                  </div>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                  Follow
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Marcus"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Marcus Chen</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">Staff Frontend & Design Systems</p>
                  </div>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
