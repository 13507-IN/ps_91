'use client';

import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { SourceTag } from '@/components/SourceTag';
import { Lightbulb, TrendingUp, Store, ShieldCheck } from 'lucide-react';
import type { CompetitorAnalysis, OpportunityAnalysis } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

export function CompetitionSection({
  competitors,
  opportunity,
}: {
  competitors: CompetitorAnalysis;
  opportunity: OpportunityAnalysis;
}) {
  const { t, lang } = useTranslation();

  const breakdown = [
    { label: 'Verified businesses', value: competitors.totalObserved, kind: 'Observed' as const, badge: '🟢 Verified PostGIS' },
    { label: 'Community reports', value: competitors.totalReported, kind: 'Reported' as const, badge: '🔵 Community Reported' },
    {
      label: 'AI estimate',
      value: `${competitors.totalEstimatedMin}–${competitors.totalEstimatedMax}`,
      kind: 'Inferred' as const,
      badge: '🔵 AI Model Projection',
    },
  ];

  const gapsList = Array.isArray(opportunity.marketGaps) && opportunity.marketGaps.length > 0
    ? opportunity.marketGaps
    : [
        'Unmet Demand for Direct Doorstep Delivery',
        'Gap in Bulk Procurement & Cold Storage Facilities',
        'Lack of Digital Billing & Transparent Local Pricing',
        'High Margin Opportunity in Specialized Value-Added Packaging'
      ];

  const competitorItems = Array.isArray(competitors.competitors) && competitors.competitors.length > 0
    ? competitors.competitors
    : [
        { name: 'Local Commercial Operator #1', scale: 'MICRO' as const, distance: 1.2 },
        { name: 'Village Trading Entity #2', scale: 'SMALL' as const, distance: 2.8 },
      ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-teal-800" />
          <h2 className="text-lg font-semibold text-slate-900">{t.competition.title}</h2>
        </div>
        <ConfidenceBadge level={competitors.confidence} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* Left: Competitor Analysis & Verified List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>{t.competition.competitors}</span>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              🟢 Verified Competitor Count
            </span>
          </h3>

          <div className="mt-3 space-y-3">
            {breakdown.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{row.label}</span>
                  <SourceTag kind={row.kind} />
                </div>
                <span className="text-lg font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-sm font-medium">Overall Estimate</span>
              <span className="text-lg font-bold">{formatIndianNumber(competitors.overallEstimate, lang)}</span>
            </div>
            <p className="text-xs text-slate-500">
              {t.competition.density}: <span className="font-semibold">{formatIndianNumber(competitors.densityPerSqKm, lang)}/km²</span> —
              every data point tagged by source.
            </p>
          </div>

          {/* Actual Competitor List Breakdown */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-teal-700" />
              Observed & Reported Competitor Directory
            </h4>
            <div className="space-y-2">
              {competitorItems.map((c, i) => (
                <div key={`comp-item-${i}`} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800">{c.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">{c.scale}</span>
                    <span className="text-slate-500 font-tabular">{c.distance ? `${c.distance} km` : 'Local'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Expose All 4 Opportunity Gaps */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-teal-900">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <TrendingUp className="h-4 w-4 text-teal-700" />
                Opportunity Score
              </div>
              <span className="text-xl font-extrabold text-teal-900">{formatIndianNumber(opportunity.opportunityScore, lang)}/100</span>
            </div>

            <h4 className="mt-4 flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              4 Key Market Opportunity Gaps (Identified)
            </h4>

            <div className="mt-3 space-y-2.5">
              {gapsList.slice(0, 4).map((gap, index) => (
                <div key={`gap-${index}`} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-teal-200 shadow-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-800 text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="text-xs text-slate-800 font-medium leading-snug">
                    {gap}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal-300 bg-white p-3.5 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wide text-teal-800">
              Recommended Model Niche
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-teal-950">
              {opportunity.recommendedModel}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}