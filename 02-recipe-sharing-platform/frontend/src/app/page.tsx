'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Star, Users, Flame, Sparkles, ChefHat, Check } from 'lucide-react';

interface RecipeCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  cuisine: string;
  category: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes?: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  averageRating: number;
  ratingsCount: number;
  creator: {
    displayName: string;
    username: string;
    avatarUrl: string;
  };
  ingredientsSummary: string[];
}

const RECIPES: RecipeCard[] = [
  {
    id: '1',
    slug: 'authentic-roman-rigatoni-alla-carbonara',
    title: 'Authentic Roman Rigatoni alla Carbonara',
    description: 'Crispy cured guanciale, tempered farm-fresh egg yolks, sharp Pecorino Romano DOP, and cracked black pepper. Zero cream.',
    coverImageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    cuisine: 'Italian',
    category: 'Pasta & Noodles',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    difficulty: 'MEDIUM',
    averageRating: 4.9,
    ratingsCount: 38,
    creator: {
      displayName: 'Chef Antonio Rossi',
      username: 'chef_antonio',
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=100&q=80',
    },
    ingredientsSummary: ['Rigatoni Pasta', 'Guanciale', 'Fresh Egg Yolks', 'Pecorino Romano Cheese', 'Coarse Black Pepper'],
  },
  {
    id: '2',
    slug: 'artisan-high-hydration-country-sourdough',
    title: 'Artisan High-Hydration Country Sourdough Boule',
    description: 'Open, custardy crumb with blistered caramelized crust. Uses an overnight cold retard to develop rich lactic flavor.',
    coverImageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    cuisine: 'French',
    category: 'Breads & Pastry',
    prepTimeMinutes: 45,
    cookTimeMinutes: 45,
    servings: 10,
    difficulty: 'HARD',
    averageRating: 5.0,
    ratingsCount: 24,
    creator: {
      displayName: 'Mei Lin',
      username: 'chef_mei',
      avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80',
    },
    ingredientsSummary: ['Bread Flour', 'Water', 'Active Sourdough Starter', 'Fine Sea Salt'],
  },
];

export default function RecipesHomePage() {
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [pantryInput, setPantryInput] = useState('');
  const [ingredientFilterActive, setIngredientFilterActive] = useState(false);

  const filteredRecipes = RECIPES.filter((r) => {
    if (selectedCuisine !== 'All' && r.cuisine !== selectedCuisine) return false;
    if (ingredientFilterActive && pantryInput.trim()) {
      const items = pantryInput.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      const match = items.some((item) =>
        r.ingredientsSummary.some((ing) => ing.toLowerCase().includes(item))
      );
      return match;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Culinary Community Hero */}
      <section className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"
            alt="Culinary background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/70 to-transparent" />
        </div>

        <div className="relative py-16 px-8 sm:px-12 max-w-2xl text-white">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Precision Culinary Community
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Recipes as Structured Craft. Never Guess Measurements.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-200 leading-relaxed">
            Dynamic exact rational fraction scaling, countertop cook mode with screen wake lock, and dimension-safe weekly shopping list compilation.
          </p>
        </div>
      </section>

      {/* Interactive "Pantry Search: What's In Your Kitchen?" */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" /> What ingredients do you have?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter ingredients you have at home (e.g., egg yolks, guanciale, flour) to rank matching recipes.
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              placeholder="e.g. egg yolks, pasta, pecorino"
              className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-600 focus:bg-white transition-colors"
            />
            <button
              onClick={() => setIngredientFilterActive(true)}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              Match Recipes
            </button>
            {ingredientFilterActive && (
              <button
                onClick={() => {
                  setIngredientFilterActive(false);
                  setPantryInput('');
                }}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cuisine Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['All', 'Italian', 'French', 'East Asian', 'Mediterranean'].map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCuisine === cuisine
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col group"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={recipe.coverImageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-stone-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {recipe.cuisine}
              </span>
              <span className="absolute top-4 right-4 bg-stone-950/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {recipe.averageRating}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <Link href={`/recipe/${recipe.slug}`}>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">
                    {recipe.title}
                  </h3>
                </Link>
                <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" /> {recipe.totalTimeMinutes}m
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-stone-400" /> {recipe.servings} Servings
                  </span>
                </div>
                <span className="font-bold text-amber-700 text-[11px] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
