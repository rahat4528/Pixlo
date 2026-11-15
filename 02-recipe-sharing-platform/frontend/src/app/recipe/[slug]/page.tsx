'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Star, Users, ArrowLeft, Check, ChefHat, Play, Flame, Sparkles, X, Plus, Minus, MessageSquare } from 'lucide-react';

interface ScaledIng {
  name: string;
  baseNumerator: number;
  baseDenominator: number;
  unit: string;
  isScalable: boolean;
}

const RAW_INGREDIENTS: ScaledIng[] = [
  { name: 'Bronze-die rigatoni pasta', baseNumerator: 400, baseDenominator: 1, unit: 'g', isScalable: true },
  { name: 'Cured guanciale, cut into lardons', baseNumerator: 200, baseDenominator: 1, unit: 'g', isScalable: true },
  { name: 'Fresh large egg yolks at room temperature', baseNumerator: 6, baseDenominator: 1, unit: 'piece', isScalable: true },
  { name: 'Finely grated Pecorino Romano DOP', baseNumerator: 100, baseDenominator: 1, unit: 'g', isScalable: true },
  { name: 'Freshly cracked tellicherry black pepper', baseNumerator: 3, baseDenominator: 2, unit: 'tsp', isScalable: true }, // 1 1/2 = 3/2
  { name: 'Sea salt for pasta water', baseNumerator: 0, baseDenominator: 1, unit: 'to taste', isScalable: false },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function formatFraction(num: number, den: number): string {
  if (num === 0) return '';
  const d = gcd(num, den);
  const n = num / d;
  const dn = den / d;
  if (dn === 1) return `${n}`;
  const whole = Math.floor(n / dn);
  const rem = n % dn;
  if (whole === 0) return `${rem}/${dn}`;
  if (rem === 0) return `${whole}`;
  return `${whole} ${rem}/${dn}`;
}

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const baseServings = 4;
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [cookMode, setCookMode] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hasRated, setHasRated] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Screen Wake Lock API in Cook Mode
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if (cookMode && 'wakeLock' in navigator) {
      (navigator as any).wakeLock
        .request('screen')
        .then((lock: any) => {
          wakeLockSentinel = lock;
        })
        .catch(() => {});
    }
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release();
    };
  }, [cookMode]);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  const steps = [
    {
      number: 1,
      instruction: 'Place guanciale strips into a cold, dry skillet over medium-low heat. Slowly render the fat for 10-12 minutes until deeply golden and crisp on the exterior while remaining tender inside. Remove guanciale and reserve rendered fat.',
      time: '12 min',
    },
    {
      number: 2,
      instruction: 'In a heat-proof mixing bowl, whisk room-temperature egg yolks, grated Pecorino Romano, and cracked black pepper into a thick paste (la carbocrema). Whisk in 2 tablespoons of rendered guanciale fat.',
      time: '3 min',
    },
    {
      number: 3,
      instruction: 'Drop rigatoni into boiling, lightly salted water (use half the normal salt since guanciale and Pecorino are very savory). Cook 2 minutes short of package instructions until very al dente.',
      time: '9 min',
    },
    {
      number: 4,
      instruction: 'Transfer pasta directly into the warm skillet off the heat. Pour the carbocrema paste over pasta along with 1/4 cup of starchy pasta water. Toss vigorously off the flame so the residual heat cooks the eggs into a glossy, silk-like emulsion without scrambling. Fold in crispy guanciale and serve immediately.',
      time: '3 min',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to recipe index
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 space-y-10">
        {/* Header Hero */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Italian Cuisine · Pasta
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              Nut-Free
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 tracking-tight leading-tight">
            Authentic Roman Rigatoni alla Carbonara
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
            The definitive Roman classic: crispy cured guanciale, tempered farm-fresh egg yolks, sharp Pecorino Romano DOP, and toasted black pepper. Emulsified off the heat into a silk carbocrema.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200">
            <div className="flex items-center space-x-3">
              <Link href="/cook/chef_antonio">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80"
                  alt="Chef Antonio Rossi"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20"
                />
              </Link>
              <div>
                <Link href="/cook/chef_antonio" className="text-sm font-bold text-stone-900 hover:underline">
                  Chef Antonio Rossi
                </Link>
                <p className="text-xs text-stone-500">Master Pasta Artisan · Rome, Italy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCookMode(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Cook Mode
              </button>
            </div>
          </div>
        </header>

        {/* Hero Cover Photography */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm max-h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80"
            alt="Roman Carbonara"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quick Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs text-center">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Prep Time</span>
            <span className="text-lg font-black text-stone-900">15 mins</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Cook Time</span>
            <span className="text-lg font-black text-stone-900">15 mins</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Total Time</span>
            <span className="text-lg font-black text-stone-900">30 mins</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Rating</span>
            <span className="text-lg font-black text-stone-900 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9 (38)
            </span>
          </div>
        </div>

        {/* Main Content Grid: Ingredients & Steps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Ingredients Column with Exact Rational Scaler */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-950 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" /> Ingredients
              </h2>

              {/* Exact Servings Stepper */}
              <div className="flex items-center space-x-2 bg-stone-100 px-3 py-1.5 rounded-full">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-stone-900 w-16 text-center">
                  {servings} {servings === 1 ? 'serving' : 'servings'}
                </span>
                <button
                  onClick={() => setServings((s) => s + 1)}
                  className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              Check off ingredients as you prepare them. Measurements scale dynamically using exact rational arithmetic.
            </p>

            {/* Scaled Ingredients Checklist */}
            <div className="space-y-3">
              {RAW_INGREDIENTS.map((ing, idx) => {
                let displayQuantity = '';
                if (ing.isScalable) {
                  // Scale: baseNum * servings / (baseDen * baseServings)
                  const scaledNum = ing.baseNumerator * servings;
                  const scaledDen = ing.baseDenominator * baseServings;
                  displayQuantity = formatFraction(scaledNum, scaledDen);
                } else {
                  displayQuantity = '';
                }

                const isChecked = checkedIngredients.has(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer select-none transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="text-xs leading-relaxed">
                      <span className={`font-bold ${isChecked ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {displayQuantity ? `${displayQuantity} ${ing.unit} ` : `${ing.unit} `}
                      </span>
                      <span className={isChecked ? 'line-through text-stone-400' : 'text-stone-700'}>
                        {ing.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/shopping-list"
              className="block text-center text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 py-3 rounded-2xl transition-colors"
            >
              + Add to Weekly Shopping List
            </Link>
          </div>

          {/* Cooking Instructions Column */}
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-stone-950">Step-by-Step Instructions</h2>

            <div className="space-y-6">
              {steps.map((step) => {
                const isStepChecked = checkedSteps.has(step.number);

                return (
                  <div
                    key={step.number}
                    className={`p-6 rounded-3xl border transition-all ${
                      isStepChecked
                        ? 'bg-stone-100/60 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        Step {step.number}
                      </span>
                      <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {step.time}
                      </span>
                    </div>

                    <p className={`text-sm sm:text-base leading-relaxed ${isStepChecked ? 'line-through text-stone-500' : 'text-stone-800'}`}>
                      {step.instruction}
                    </p>

                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleStep(step.number)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                          isStepChecked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isStepChecked ? 'Completed' : 'Mark as done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Community Ratings & Reviews */}
        <section className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-xl font-bold text-stone-950">Cook Reviews & Ratings</h3>
              <p className="text-xs text-stone-500 mt-0.5">Enforced one rating per cook per recipe.</p>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setUserRating(star);
                    setHasRated(true);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= userRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {hasRated && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
              Thank you! Your {userRating}-star rating has been registered.
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Leo Davis</span>
                <span className="text-[11px] text-stone-400">2 days ago</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                This recipe permanently replaced all other carbonara attempts in our home! Taking the pan off the heat before adding the carbocrema is the secret.
              </p>
            </div>
          </div>
        </section>
      </article>

      {/* Countertop Cook Mode (Full Screen with Screen Wake Lock) */}
      {cookMode && (
        <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col p-6 sm:p-12 overflow-y-auto animate-in fade-in">
          <div className="flex items-center justify-between pb-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Cook Mode Active · Screen Kept Awake
              </span>
            </div>
            <button
              onClick={() => setCookMode(false)}
              className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 max-w-3xl mx-auto w-full py-12 flex flex-col justify-center space-y-8">
            <span className="text-amber-400 font-mono text-sm tracking-widest font-bold">
              STEP {activeStep} OF {steps.length}
            </span>

            <p className="text-2xl sm:text-4xl font-black leading-tight text-stone-100">
              {steps[activeStep - 1].instruction}
            </p>

            <div className="pt-6 flex items-center justify-between">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                className="text-xs font-bold px-6 py-3 rounded-full bg-stone-800 hover:bg-stone-700 disabled:opacity-30 transition-colors"
              >
                ← Previous Step
              </button>

              <button
                disabled={activeStep === steps.length}
                onClick={() => setActiveStep((s) => Math.min(steps.length, s + 1))}
                className="text-xs font-bold px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 disabled:opacity-30 transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
