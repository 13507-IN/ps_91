'use client';

import { MapPin, RefreshCw, FileText, Sparkles, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { VerdictGauge } from './VerdictGauge';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { dateTime } from '@/lib/format';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { translateDecision, translateGrade } from '@/lib/i18n/reportTranslator';

const bgGradient: Record<string, string> = {
  EXCELLENT: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-emerald-200',
  GOOD: 'bg-gradient-to-br from-sky-50/90 via-teal-50/40 to-white border-teal-200',
  MODERATE: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border-amber-200',
  POOR: 'bg-gradient-to-br from-rose-50/90 via-red-50/40 to-white border-rose-200',
};

export function VerdictHeroSection({ report }: { report: FeasibilityReport }) {
  const { feasibilityScore, aiRecommendation, confidence, catchment, createdAt, businessIdea, financialPlan } =
    report;
  const { t, lang } = useTranslation();

  const decisionObj = translateDecision(aiRecommendation.decision, lang);
  const gradeLabel = translateGrade(feasibilityScore.grade, lang);

  const avgMonthlyCashflow = financialPlan?.cashflow?.averageMonthlyCashflow ?? 0;
  const matchedSchemeName = financialPlan?.matchedSchemeName;

  return (
    <section className={`rounded-2xl border p-6 md:p-7 shadow-xs transition-all ${bgGradient[feasibilityScore.grade] || 'bg-white border-slate-200'}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <VerdictGauge score={feasibilityScore.totalScore} grade={feasibilityScore.grade} />
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#E65C00]" /> {t.feasibilityReportDetails.headerBadge}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{businessIdea}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${decisionObj.bg} ${decisionObj.text} ${decisionObj.border}`}>
              {decisionObj.label}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
              {gradeLabel}
            </span>
            <ConfidenceBadge level={confidence} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {[
                report.villageName || report.opportunityAnalysis?.villageName,
                report.district || report.opportunityAnalysis?.districtName,
              ].filter(Boolean).length > 0 && (
                <span className="font-semibold text-slate-700">
                  {[
                    report.villageName || report.opportunityAnalysis?.villageName,
                    report.district || report.opportunityAnalysis?.districtName,
                  ].filter(Boolean).join(', ')} ·{' '}
                </span>
              )}
              {catchment.latitude.toFixed(4)}, {catchment.longitude.toFixed(4)} · {catchment.radiusKm} km radius
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              {dateTime(createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Executive Summary Card */}
      <div className="mt-6 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/90 via-white to-sky-50/40 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1A3A6B] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A3A6B]">
              {t.feasibilityReportDetails.summaryTitle}
            </h3>
          </div>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
            {t.feasibilityReportDetails.aiEngineBadge}
          </span>
        </div>

        <p className="text-sm md:text-base leading-relaxed text-slate-800 font-normal">
          {aiRecommendation.summary}
        </p>

        {/* Snapshot Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-sky-100/70 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-sky-200/60 font-semibold text-slate-700 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {t.feasibilityReportDetails.verdictLabel}: <span className="font-bold text-emerald-700">{formatIndianNumber(feasibilityScore.totalScore, lang)}/100</span>
          </div>
          {avgMonthlyCashflow > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-sky-200/60 font-semibold text-slate-700 shadow-xs">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              {t.plainSummary.cardProfit}: <span className="font-bold text-emerald-700">₹{formatIndianNumber(Math.round(avgMonthlyCashflow), lang)}</span>
            </div>
          )}
          {matchedSchemeName && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-sky-200/60 font-semibold text-slate-700 shadow-xs">
              <Landmark className="h-3.5 w-3.5 text-sky-600" />
              {t.plainSummary.costFromGovt}: <span className="font-bold text-slate-900">{matchedSchemeName}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}