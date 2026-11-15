'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, Star, Clock, Users, ArrowLeft } from 'lucide-react';

export default function CookProfilePage({ params }: { params: { username: string } }) {
  const chef = {
    displayName: 'Chef Antonio Rossi',
    username: params.username || 'chef_antonio',
    bio: 'Third-generation Roman pasta artisan. Obsessed with traditional dough hydration, seasonal guanciale, and zero-compromise technique.',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
    specialties: ['Artisan Pasta', 'Roman Sauces', 'Focaccia Baking'],
    experienceLevel: 'Professional Chef',
  };

  const recipes = [
    {
      id: '1',
      slug: 'authentic-roman-rigatoni-alla-carbonara',
      title: 'Authentic Roman Rigatoni alla Carbonara',
      coverImageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
      time: '30 mins',
      servings: 4,
      rating: 4.9,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link href="/" className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to recipe index
      </Link>

      {/* Chef Profile Banner */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
        <img
          src={chef.avatarUrl}
          alt={chef.displayName}
          className="w-28 h-28 rounded-full object-cover ring-4 ring-amber-500/20 shadow-md"
        />

        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">{chef.displayName}</h1>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block self-center sm:self-auto">
              {chef.experienceLevel}
            </span>
          </div>

          <p className="text-xs text-stone-400">@{chef.username}</p>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">{chef.bio}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            {chef.specialties.map((s) => (
              <span key={s} className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chef's Recipes */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-stone-900">
          Recipes by {chef.displayName} ({recipes.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((r) => (
            <Link
              key={r.id}
              href={`/recipe/${r.slug}`}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow block group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={r.coverImageUrl}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors">
                  {r.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" /> {r.time}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-stone-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {r.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
