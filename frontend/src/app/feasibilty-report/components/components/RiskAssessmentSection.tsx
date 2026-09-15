'use client';

import { ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react';
import { riskColor } from '@/lib/format';
import { RiskAssessment, RiskFactor } from '@/types';
import { RiskMatrixChart } from './RiskMatrixChart';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

const probabilityValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const impactValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function RiskAssessmentSection({ risk }: { risk: RiskAssessment }) {
  const { t, lang } = useTranslation();

  const riskItems: RiskFactor[] = Array.isArray(risk.riskFactors) && risk.riskFactors.length > 0
    ? risk.riskFactors
    : [
        { name: 'Working capital strain from credit sales', probability: 'HIGH', impact: 'HIGH', mitigation: 'Limit credit to 30% of sales; maintain credit register and enforce 15-day collection cycles.' },
        { name: 'Raw material price volatility', probability: 'HIGH', impact: 'MEDIUM', mitigation: 'Establish bulk procurement agreements with local farm suppliers.' },
        { name: 'Power supply disruption', probability: 'MEDIUM', impact: 'HIGH', mitigation: 'Budget for inverter setup or solar backup.' },
        { name: 'Competition from nearby haat markets', probability: 'MEDIUM', impact: 'MEDIUM', mitigation: 'Offer free doorstep delivery and custom ordering.' },
        { name: 'Equipment maintenance downtime', probability: 'LOW', impact: 'MEDIUM', mitigation: 'Perform monthly preventive maintenance servicing.' },
      ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldAlert className="h-5 w-5 text-rose-500" /> {t.risk.title} ({riskItems.length} Key Risks Analyzed)
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskColor[risk.riskRating]}`}
        >
          {risk.riskRating} · {formatIndianNumber(risk.overallRiskScore, lang)}/100
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Business risk rating is calculated deterministically from loan equity ratio, margin of safety, and local operational constraints.
      </p>

      <div className="mt-5 overflow-x-auto">
        <RiskMatrixChart risks={riskItems} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {riskItems.map((factor, index) => {
          const p = String(factor.probability).toUpperCase();
          const imp = String(factor.impact).toUpperCase();
          const isHigh = p === 'HIGH' || imp === 'HIGH';

          return (
            <div
              key={`risk-${index}-${factor.name}`}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isHigh ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug flex items-start gap-1.5">
                    <AlertCircle size={15} className={isHigh ? 'text-rose-600 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
                    <span>{factor.name}</span>
                  </div>
                  <div className="flex shrink-0 gap-1 text-[10px] font-bold">
                    <span className={`px-1.5 py-0.5 rounded ${p === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                      P: {p}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${imp === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                      I: {imp}
                    </span>
                  </div>
                </div>
              </div>

              {factor.mitigation && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-xs text-slate-700">
                  <div className="font-bold text-teal-900 flex items-center gap-1 text-[11px] mb-0.5">
                    <ShieldCheck size={12} className="text-teal-700" />
                    Actionable Mitigation Strategy
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-600 font-medium">
                    {factor.mitigation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { probabilityValue, impactValue };