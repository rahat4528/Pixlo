'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper,
  Compass,
  Bookmark,
  Sliders,
  Settings,
  Flame,
  Search,
  Radio,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All News', href: '/' },
  { name: 'Technology', href: '/category/technology' },
  { name: 'Business', href: '/category/business' },
  { name: 'Science', href: '/category/science' },
  { name: 'World', href: '/category/world' },
  { name: 'Local', href: '/category/local' },
  { name: 'Sports', href: '/category/sports' },
];

export function NewsHeader() {
  const pathname = usePathname();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="border-b border-news-border bg-white sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="border-b border-news-border/60 bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white uppercase tracking-wider">{currentDate}</span>
            <span className="text-slate-500">•</span>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Syndication Engine Active</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/feed"
              className="hover:text-white flex items-center space-x-1 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Personalized Feed</span>
            </Link>
            <Link
              href="/saved"
              className="hover:text-white flex items-center space-x-1 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Articles</span>
            </Link>
            <Link
              href="/admin/ingestion"
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Ingestion Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-news-accent text-white rounded-lg shadow-sm">
            <Newspaper className="w-7 h-7" />
          </div>
          <div>
            <Link href="/" className="group">
              <span className="font-headline font-black text-2xl sm:text-3xl tracking-tight text-news-ink group-hover:text-news-accent transition-colors">
                PIXLO NEWS
              </span>
            </Link>
            <p className="text-xs text-news-muted font-medium tracking-wide">
              Autonomous Real-Time News Syndication & Story Clustering
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search headlines, topics, publishers..."
            className="w-full bg-slate-50 border border-news-border rounded-lg pl-9 pr-4 py-2 text-sm text-news-ink focus:outline-none focus:ring-2 focus:ring-news-accent/20 focus:border-news-accent transition"
          />
          <Search className="w-4 h-4 text-news-muted absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Category Nav Tabs */}
      <nav className="border-t border-news-border bg-white px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map((cat) => {
            const isActive = pathname === cat.href;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-news-ink text-white shadow-sm'
                    : 'text-news-muted hover:text-news-ink hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
