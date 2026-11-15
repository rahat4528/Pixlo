'use client';

import React from 'react';
import Link from 'next/link';
import { Search, PenSquare, Bell, Bookmark, BarChart2, BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="font-serif font-black text-2xl tracking-tighter text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-sans font-bold text-sm">P</span>
            Pixlo Blog
          </Link>

          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-64 text-sm text-gray-600 focus-within:w-80 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search architecture, UX, tech..."
              className="bg-transparent border-none outline-none w-full text-sm text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <nav className="flex items-center space-x-5">
          <Link
            href="/write"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <PenSquare className="w-4 h-4 mr-1.5 text-gray-500" />
            Write
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <BarChart2 className="w-4 h-4 mr-1.5 text-gray-500" />
            Author Studio
          </Link>

          <Link
            href="/reading-list"
            className="text-gray-500 hover:text-gray-900 transition-colors"
            title="Reading List"
          >
            <Bookmark className="w-5 h-5" />
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          <Link href="/author/elena_writes" className="flex items-center gap-2">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              alt="Elena Rostova"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
            />
            <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Elena R.</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
