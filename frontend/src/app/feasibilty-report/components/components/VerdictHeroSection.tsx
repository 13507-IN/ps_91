'use client';

import { MapPin, RefreshCw } from 'lucide-react';
import { VerdictGauge } from './VerdictGauge';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { decisionColor, gradeBadge, dateTime } from '@/lib/format';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

const bgGradient: Record<string, string> = {
  EXCELLENT: 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200',
  GOOD: 'bg-gradient-to-br from-teal-50 to-sky-50/50 border-teal-200',
  MODERATE: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200',
  POOR: 'bg-gradient-to-br from-rose-50 to-red-50/50 border-rose-200',
};

export function VerdictHeroSection({ report }: { report: FeasibilityReport }) {
  const { feasibilityScore, aiRecommendation, confidence, catchment, createdAt, businessIdea } =
    report;
  const { t } = useTranslation();

  const getDecisionText = (decision: string) => {
    if (decision === 'PROCEED') return t.report.proceed;
    if (decision === 'CAUTION') return t.report.caution;
    if (decision === 'NOT_VIABLE') return t.report.notViable;
    return decision.replaceAll('_', ' ');
  };

  const getGradeText = (grade: string) => {
    if (grade === 'EXCELLENT' || grade === 'GOOD') return t.report.good;
    if (grade === 'MODERATE') return t.report.fair;
    if (grade === 'POOR') return t.report.poor;
    return grade;
  };

  return (
    <section className={`rounded-2xl border p-6 ${bgGradient[feasibilityScore.grade] || 'bg-white border-slate-200'}`}>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
        <VerdictGauge score={feasibilityScore.totalScore} grade={feasibilityScore.grade} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{businessIdea}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${decisionColor[aiRecommendation.decision]}`}
            >
              {getDecisionText(aiRecommendation.decision)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${gradeBadge[feasibilityScore.grade]}`}
            >
              {getGradeText(feasibilityScore.grade)}
            </span>
            <ConfidenceBadge level={confidence} />
          </div>

          <p className="mt-3 text-sm text-slate-600">{aiRecommendation.summary}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {catchment.latitude.toFixed(4)}, {catchment.longitude.toFixed(4)} · {catchment.radiusKm} km
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {dateTime(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}