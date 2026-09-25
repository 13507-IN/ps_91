'use client';

import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { SUCCESS_STORIES } from '@/lib/data/successStories';
import { StoryCard } from './components/StoryCard';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'ALL', label: 'All Sectors' },
  { value: 'DAIRY', label: 'Dairy & Milk' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing' },
  { value: 'TEXTILES_TAILORING', label: 'Textiles & Handloom' },
  { value: 'POULTRY', label: 'Poultry & Livestock' },
  { value: 'RETAIL', label: 'Retail & Grocery' },
  { value: 'HANDICRAFT', label: 'Handicrafts' },
];

export default function SuccessStoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredStories =
    selectedCategory === 'ALL'
      ? SUCCESS_STORIES
      : SUCCESS_STORIES.filter((s) => s.categoryCode === selectedCategory);

  const totalCapitalMobilized = SUCCESS_STORIES.reduce((sum, s) => sum + s.initialInvestment, 0);
  const totalJobsCreated = SUCCESS_STORIES.reduce((sum, s) => sum + s.jobsCreated, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#102347] via-[#1A3A6B] to-[#1E4A8A] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
              <Award size={14} />
              Real Rural Enterprise Journeys
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rural Success Stories & Case Studies
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Explore how grassroots entrepreneurs in Nadia turned local market gaps into profitable micro-enterprises with government scheme funding and ArthSetu intelligence.
            </p>
          </div>
        </div>

        {/* Impact Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-[#1A3A6B]">₹{(totalCapitalMobilized / 100000).toFixed(1)} Lakh+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Capital Mobilized</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-saffron">{totalJobsCreated}+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Rural Jobs Created</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-emerald-700">5.8 Months</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Avg. Break-even Period</div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-[#1A3A6B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-[#102347] via-[#1A3A6B] to-[#0D1D3A] rounded-2xl p-6 text-white text-center sm:flex sm:items-center sm:justify-between gap-4">
          <div className="text-left space-y-1">
            <h3 className="text-lg font-bold">Ready to write your own success story?</h3>
            <p className="text-xs text-blue-100/90">
              Run a free 60-second AI feasibility check tailored to your village and available capital.
            </p>
          </div>
          <Link
            href="/assessment-wizard"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 active:scale-95 transition-all shadow-md shrink-0"
          >
            Start Assessment Wizard
          </Link>
        </div>
      </div>
    </div>
  );
}
