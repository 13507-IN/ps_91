'use client';

import type { FeasibilityScore } from '@/types';

const dimensions = [
  { key: 'marketDemandScore', label: 'Market Demand', color: 'bg-emerald-500' },
  { key: 'competitionScore', label: 'Competition', color: 'bg-sky-500' },
  { key: 'financialViabilityScore', label: 'Financial Viability', color: 'bg-amber-500' },
  { key: 'capitalAdequacyScore', label: 'Capital Adequacy', color: 'bg-violet-500' },
  { key: 'riskResilienceScore', label: 'Risk Resilience', color: 'bg-rose-500' },
] as const;

export function ScoreBreakdownChart({ score }: { score: FeasibilityScore }) {
  return (
    <div className="space-y-3">
      {dimensions.map(({ key, label, color }) => {
        const value = score[key];
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-semibold text-slate-900">{value}/20</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${(value / 20) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
        <span className="text-sm font-medium">Total Score</span>
        <span className="text-lg font-bold">
          {score.totalScore}
          <span className="ml-1 text-xs font-normal text-slate-400">/ 100 · {score.grade}</span>
        </span>
      </div>
    </div>
  );
}