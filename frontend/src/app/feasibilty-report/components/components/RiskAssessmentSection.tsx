'use client';

import { ShieldAlert } from 'lucide-react';
import { riskColor } from '@/lib/format';
import { RiskAssessment } from '@/types';
import { RiskMatrixChart } from './RiskMatrixChart';

const probabilityValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const impactValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function RiskAssessmentSection({ risk }: { risk: RiskAssessment }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldAlert className="h-5 w-5 text-rose-500" /> Risk Assessment
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskColor[risk.riskRating]}`}
        >
          Risk {risk.riskRating} · {risk.overallRiskScore}/100
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Business risk is separate from data confidence — a low-risk business can still need
        validation when data confidence is low.
      </p>

      <div className="mt-5 overflow-x-auto">
        <RiskMatrixChart risks={risk.riskFactors} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {risk.riskFactors.map((factor) => (
          <div key={factor.name} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">{factor.name}</div>
              <div className="flex shrink-0 gap-1.5 text-[10px] font-semibold">
                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700">
                  P: {factor.probability}
                </span>
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                  I: {factor.impact}
                </span>
              </div>
            </div>
            {factor.mitigation && (
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                <span className="font-medium text-brand-700">Mitigation: </span>
                {factor.mitigation}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export { probabilityValue, impactValue };