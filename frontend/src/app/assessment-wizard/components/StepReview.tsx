'use client';
import React from 'react';

import { MapPin, Briefcase, IndianRupee, User, Loader2, ArrowRight } from 'lucide-react';
import { inr } from '@/lib/format';
import type { WizardDraft } from '@/types';

interface StepReviewProps {
  draft: WizardDraft;
  onBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  DAIRY: 'Dairy', FOOD_PROCESSING: 'Food Processing', RETAIL: 'Retail Shop',
  TEXTILES_TAILORING: 'Textiles & Tailoring', POULTRY: 'Poultry', AGRICULTURE: 'Agriculture',
  LIVESTOCK: 'Livestock', TRANSPORT: 'Transport', HANDICRAFT: 'Handicraft',
  SERVICES: 'Services', OTHER: 'Other',
};

export default function StepReview({ draft, onBack, isSubmitting, setIsSubmitting }: StepReviewProps) {
  function handleAnalyze() {
    setIsSubmitting(true);
    // Backend integration: POST /api/feasibility/analyze with draft data
    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = '/feasibility-report';
    }, 2200);
  }

  return (
    <div className="space-y-6">
      <p className="text-ink-muted text-sm">
        Review your inputs below. Once confirmed, we will run the full feasibility analysis — this typically takes 8–15 seconds.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-900/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={17} className="text-teal-900" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Location</div>
            <div className="font-bold text-teal-900 text-sm">{draft.villageName || 'Not selected'}</div>
            {draft.district && (
              <div className="text-ink-subtle text-xs">{draft.block} · {draft.district} · {draft.state}</div>
            )}
          </div>
        </div>

        {/* Business */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-saffron/15 flex items-center justify-center flex-shrink-0">
            <Briefcase size={17} className="text-saffron" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Business Category</div>
            <div className="font-bold text-teal-900 text-sm">{draft.businessCategory ? CATEGORY_LABELS[draft.businessCategory] : 'Not selected'}</div>
            {draft.businessIdea && (
              <div className="text-ink-subtle text-xs line-clamp-2 mt-0.5">{draft.businessIdea}</div>
            )}
          </div>
        </div>

        {/* Capital */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-flag-green/10 flex items-center justify-center flex-shrink-0">
            <IndianRupee size={17} className="text-flag-green" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Available Capital</div>
            <div className="font-bold text-teal-900 text-sm font-tabular">
              {draft.availableCapital ? inr(draft.availableCapital) : 'Not entered'}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-400/15 flex items-center justify-center flex-shrink-0">
            <User size={17} className="text-teal-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Profile</div>
            <div className="text-ink text-sm">
              {[
                draft.age && `Age ${draft.age}`,
                draft.gender,
                draft.category,
              ].filter(Boolean).join(' · ') || 'Not provided (optional)'}
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-saffron-soft border border-saffron/30 rounded-xl p-4">
        <div className="font-semibold text-teal-900 text-sm mb-2">What happens when you click Analyze:</div>
        <ul className="space-y-1.5 text-xs text-ink-muted">
          {[
            'Market intelligence loaded for your catchment area (Census + AGMARKNET)',
            'Competitor density estimated using UDYAM + community data',
            'Best-match government scheme identified and EMI calculated',
            'AI risk assessment and viability score generated',
            'Full 30-day action plan created',
          ].map((item, i) => (
            <li key={`step-item-${i}`} className="flex items-start gap-2">
              <span className="text-saffron font-bold mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-ink-muted hover:bg-paper-dark transition-colors">
          Back
        </button>
        <button
          onClick={handleAnalyze}
          disabled={isSubmitting}
          className="btn-saffron px-8 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 min-w-[180px] justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Run Feasibility Analysis
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}