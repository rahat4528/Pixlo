'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ShoppingCart, Plus, Clock, ChefHat, Sparkles } from 'lucide-react';

export default function MealPlannerPage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [schedule, setSchedule] = useState({
    Tuesday: {
      Dinner: {
        title: 'Authentic Roman Rigatoni alla Carbonara',
        slug: 'authentic-roman-rigatoni-alla-carbonara',
        time: '30m',
        servings: 4,
      },
    },
    Saturday: {
      Breakfast: {
        title: 'Artisan High-Hydration Country Sourdough Boule',
        slug: 'artisan-high-hydration-country-sourdough',
        time: '90m',
        servings: 10,
      },
    },
  });

  const [isGenerated, setIsGenerated] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Planner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Weekly Meal Planner
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Map out recipes across the week and compile a dimension-safe grocery list with zero measurement conflicts.
          </p>
        </div>

        <Link
          href="/shopping-list"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" /> View Consolidated Grocery List
        </Link>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayMeals = (schedule as any)[day] || {};

          return (
            <div key={day} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                  {day}
                </span>
              </div>

              {/* Meal Slots */}
              {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                const assigned = dayMeals[mealType];

                return (
                  <div key={mealType} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-stone-400">{mealType}</span>

                    {assigned ? (
                      <Link
                        href={`/recipe/${assigned.slug}`}
                        className="block p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl hover:border-amber-300 transition-colors"
                      >
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {assigned.title}
                        </h4>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-amber-800">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {assigned.time}
                          </span>
                          <span>{assigned.servings} Servings</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="border border-dashed border-stone-200 rounded-xl p-3 text-center text-stone-400 hover:border-stone-400 transition-colors cursor-pointer">
                        <Plus className="w-3.5 h-3.5 mx-auto text-stone-300" />
                        <span className="text-[10px] mt-0.5 block">Plan Meal</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
