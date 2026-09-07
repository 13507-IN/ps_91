'use client';

import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { SourceTag } from '@/components/SourceTag';
import { Lightbulb, TrendingUp } from 'lucide-react';
import type { CompetitorAnalysis, OpportunityAnalysis } from '@/types';

export function CompetitionSection({
  competitors,
  opportunity,
}: {
  competitors: CompetitorAnalysis;
  opportunity: OpportunityAnalysis;
}) {
  const breakdown = [
    { label: 'Verified businesses', value: competitors.totalObserved, kind: 'Observed' as const },
    { label: 'Community reports', value: competitors.totalReported, kind: 'Reported' as const },
    {
      label: 'AI estimate',
      value: `${competitors.totalEstimatedMin}–${competitors.totalEstimatedMax}`,
      kind: 'Inferred' as const,
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Competition & Opportunity</h2>
        <ConfidenceBadge level={competitors.confidence} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Who else is serving this market?</h3>
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
              <span className="text-sm font-medium">Overall estimate</span>
              <span className="text-lg font-bold">{competitors.overallEstimate}</span>
            </div>
            <p className="text-xs text-slate-500">
              Density: <span className="font-semibold">{competitors.densityPerSqKm}/km²</span> —
              every number is labelled by source.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex items-center gap-2 text-brand-800">
            <TrendingUp className="h-4 w-4" />
            <h3 className="text-sm font-semibold">
              Opportunity Score <span className="ml-1 text-lg font-bold">{opportunity.opportunityScore}</span>
            </h3>
          </div>

          <h4 className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Lightbulb className="h-4 w-4 text-amber-500" /> What&apos;s missing here
          </h4>
          <ul className="mt-2 space-y-1.5">
            {(Array.isArray(opportunity.marketGaps) ? opportunity.marketGaps : []).map((gap) => (
              <li key={gap} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {gap}
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-brand-200 bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Recommended model
            </div>
            <div className="mt-1 text-sm font-semibold text-brand-800">
              {opportunity.recommendedModel}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}