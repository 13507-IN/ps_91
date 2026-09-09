'use client';
import React, { useState } from 'react';

import { MapPin, Briefcase, IndianRupee, User, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { inr } from '@/lib/format';
import { LAST_REPORT_KEY, LAST_REPORT_ID_KEY } from '@/lib/constants';
import { api, apiEndpoints } from '@/lib/api/client';
import { toFeasibilityReport, type BackendFeasibilityResult } from '@/lib/api/feasibility';
import { useTranslation } from '@/lib/i18n/useTranslation';
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
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    // Validate required fields before hitting the backend
    if (draft.latitude === undefined || draft.longitude === undefined) {
      setError(t.review.errorNoCoords);
      return;
    }
    if (!draft.businessIdea || draft.businessIdea.trim().length < 2) {
      setError(t.review.errorNoIdea);
      return;
    }
    if (typeof draft.availableCapital !== 'number' || draft.availableCapital <= 0) {
      setError(t.review.errorNoCapital);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const body = {
      latitude: draft.latitude,
      longitude: draft.longitude,
      villageId: draft.villageId,
      catchmentRadiusKm: draft.catchmentRadiusKm ?? 10,
      businessCategory: draft.businessCategory,
      businessIdea: draft.businessIdea.trim(),
      availableCapital: draft.availableCapital,
      age: draft.age,
      gender: draft.gender,
      category: draft.category,
      isMinority: draft.isMinority,
      businessExperience: draft.businessExperience,
      availableLand: draft.availableLand,
      availableEquipment: draft.availableEquipment,
      expectedWorkingHours: draft.expectedWorkingHours,
    };

    try {
      const result = await api<BackendFeasibilityResult>(
        apiEndpoints.feasibility.analyze,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      );

      const report = toFeasibilityReport(result);
      if (report.id) {
        window.sessionStorage.setItem(LAST_REPORT_ID_KEY, report.id);
      }
      window.sessionStorage.setItem(LAST_REPORT_KEY, JSON.stringify(report));
      window.location.href = '/feasibility-report?from=assessment';
    } catch (err) {
      const message = err instanceof Error ? err.message : t.review.errorGeneric;
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-ink-muted text-sm">
        {t.review.reviewHint}
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-900/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={17} className="text-teal-900" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">{t.review.locationLabel}</div>
            <div className="font-bold text-teal-900 text-sm">{draft.villageName || t.common.notSelected}</div>
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
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">{t.review.businessLabel}</div>
            <div className="font-bold text-teal-900 text-sm">{draft.businessCategory ? t.business.categories[draft.businessCategory] : t.common.notSelected}</div>
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
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">{t.review.capitalLabel}</div>
            <div className="font-bold text-teal-900 text-sm font-tabular">
              {draft.availableCapital ? inr(draft.availableCapital) : t.common.notEntered}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="card-gov p-4 flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-400/15 flex items-center justify-center flex-shrink-0">
            <User size={17} className="text-teal-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">{t.review.profileLabel}</div>
            <div className="text-ink text-sm">
              {[
                draft.age && `${t.common.age} ${draft.age}`,
                draft.gender ? (draft.gender === 'MALE' ? t.capital.genderMale : draft.gender === 'FEMALE' ? t.capital.genderFemale : t.capital.genderOther) : undefined,
                draft.category ? (draft.category === 'GENERAL' ? t.capital.general : draft.category === 'MINORITY' ? t.capital.minority : draft.category) : undefined,
              ].filter(Boolean).join(' · ') || t.common.notProvided}
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-saffron-soft border border-saffron/30 rounded-xl p-4">
        <div className="font-semibold text-teal-900 text-sm mb-2">{t.review.whatHappens}</div>
        <ul className="space-y-1.5 text-xs text-ink-muted">
          {t.review.steps.map((item, i) => (
            <li key={`step-item-${i}`} className="flex items-start gap-2">
              <span className="text-saffron font-bold mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-ink-muted hover:bg-paper-dark transition-colors disabled:opacity-50">
          {t.common.back}
        </button>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 text-xs text-grade-poor bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-xs">
              <AlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isSubmitting}
            className="btn-saffron px-8 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 min-w-[180px] justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.review.analyzing}
              </>
            ) : (
              <>
                {t.review.runAnalysis}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}