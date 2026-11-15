'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

interface GroceryItem {
  id: string;
  category: string;
  name: string;
  quantityDisplay: string;
  unit: string;
  dimension: string;
  isCompleted: boolean;
}

const INITIAL_ITEMS: GroceryItem[] = [
  { id: '1', category: 'Pantry', name: 'Bronze-die rigatoni pasta', quantityDisplay: '400', unit: 'g', dimension: 'MASS', isCompleted: false },
  { id: '2', category: 'Meat', name: 'Cured guanciale', quantityDisplay: '200', unit: 'g', dimension: 'MASS', isCompleted: true },
  { id: '3', category: 'Dairy', name: 'Fresh large egg yolks', quantityDisplay: '6', unit: 'piece', dimension: 'COUNT', isCompleted: false },
  { id: '4', category: 'Dairy', name: 'Pecorino Romano DOP', quantityDisplay: '100', unit: 'g', dimension: 'MASS', isCompleted: false },
  { id: '5', category: 'Spices', name: 'Tellicherry black pepper', quantityDisplay: '1 1/2', unit: 'tsp', dimension: 'VOLUME', isCompleted: false },
  { id: '6', category: 'Baking', name: 'Unbleached strong bread flour', quantityDisplay: '450', unit: 'g', dimension: 'MASS', isCompleted: false },
  { id: '7', category: 'Baking', name: 'Active sourdough starter', quantityDisplay: '100', unit: 'g', dimension: 'MASS', isCompleted: false },
  { id: '8', category: 'Pantry', name: 'Fine sea salt', quantityDisplay: '10', unit: 'g', dimension: 'MASS', isCompleted: false },
];

export default function ShoppingListPage() {
  const [items, setItems] = useState<GroceryItem[]>(INITIAL_ITEMS);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isCompleted: !i.isCompleted } : i))
    );
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const completedCount = items.filter((i) => i.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link href="/" className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to recipe index
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-amber-600" />
            Consolidated Grocery List
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Aggregated from scheduled weekly recipes. Ingredients merge strictly within identical unit dimensions.
          </p>
        </div>

        <div className="text-xs font-bold bg-white border border-stone-200 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
          {completedCount} of {items.length} items checked
        </div>
      </div>

      {/* Items Grouped by Category */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 inline-block px-3 py-1 rounded-full">
              {cat}
            </h2>

            <div className="divide-y divide-stone-100">
              {items
                .filter((i) => i.category === cat)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="py-3 flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.isCompleted ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                        }`}
                      >
                        {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm ${item.isCompleted ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold ${item.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {item.quantityDisplay} {item.unit}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-mono">
                        {item.dimension}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
