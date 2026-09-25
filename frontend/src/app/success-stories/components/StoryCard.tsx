'use client';

import React, { useState } from 'react';
import { Users, MapPin, ChevronDown, ChevronUp, Quote, CheckCircle2 } from 'lucide-react';
import { inr } from '@/lib/format';
import type { SuccessStory } from '@/lib/data/successStories';

export function StoryCard({ story }: { story: SuccessStory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Top Banner with Scheme Badge */}
      <div className="bg-gradient-to-r from-[#102347] to-[#1A3A6B] p-5 text-white">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-sm">
            {story.loanScheme}
          </span>
          <span className="text-xs text-blue-200 font-medium">
            {story.breakevenMonths} Mo. Payback
          </span>
        </div>

        <h3 className="font-bold text-lg text-white leading-tight">
          {story.businessName}
        </h3>

        <div className="flex items-center gap-2 text-xs text-blue-200 mt-2">
          <span className="font-semibold text-white">{story.entrepreneurName} ({story.age})</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} />
            {story.village}, {story.block}
          </span>
        </div>
      </div>

      {/* Main Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-100 text-center">
        <div>
          <div className="text-xs text-slate-500 font-medium">Investment</div>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">
            {inr(story.initialInvestment)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium">Monthly Profit</div>
          <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
            {inr(story.currentMonthlyNetProfit)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 font-medium">Jobs Created</div>
          <div className="text-sm font-extrabold text-[#1A3A6B] mt-0.5 flex items-center justify-center gap-1">
            <Users size={14} className="text-[#1A3A6B]" />
            {story.jobsCreated}
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="text-xs text-slate-700 italic bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl relative">
          <Quote size={16} className="text-amber-500 absolute -top-2 left-2 fill-amber-200" />
          <p className="pl-4 pt-1">&ldquo;{story.quote}&rdquo;</p>
        </div>

        {/* Expandable detailed story & key learnings */}
        {expanded && (
          <div className="pt-2 space-y-3 text-xs text-slate-600 border-t border-slate-100 animate-fadeIn">
            <p className="leading-relaxed">{story.storyDetails}</p>

            <div className="space-y-1.5 pt-1">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Key Entrepreneur Learnings:</div>
              <ul className="space-y-1 text-slate-600">
                {story.keyLearnings.map((learning, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1A3A6B] hover:text-[#102347] pt-1"
        >
          <span>{expanded ? 'Hide Details' : 'Read Full Journey'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
}
