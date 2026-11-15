'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Calendar, ShoppingCart, PlusCircle, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-stone-900 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span>Pixlo Recipes</span>
          </Link>

          <div className="hidden md:flex items-center bg-stone-100 border border-stone-200/80 rounded-full px-3.5 py-1.5 w-64 text-sm text-stone-600 focus-within:w-80 transition-all">
            <Search className="w-4 h-4 text-stone-400 mr-2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              className="bg-transparent border-none outline-none w-full text-sm placeholder-stone-400"
            />
          </div>
        </div>

        <nav className="flex items-center space-x-5">
          <Link
            href="/meal-planner"
            className="flex items-center text-sm font-semibold text-stone-600 hover:text-amber-700 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-stone-400" />
            Meal Planner
          </Link>

          <Link
            href="/shopping-list"
            className="flex items-center text-sm font-semibold text-stone-600 hover:text-amber-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5 text-stone-400" />
            Shopping List
          </Link>

          <div className="h-6 w-px bg-stone-200" />

          <Link href="/cook/chef_antonio" className="flex items-center gap-2">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=100&q=80"
              alt="Chef Antonio"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30"
            />
            <span className="text-xs font-bold text-stone-800 hidden sm:inline">Chef Antonio</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
