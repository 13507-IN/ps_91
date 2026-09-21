'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { riskColor } from '@/lib/format';
import { RiskAssessment, RiskFactor } from '@/types';
import { RiskMatrixChart, enrichRisks } from './RiskMatrixChart';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

const probabilityValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const impactValue: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function RiskAssessmentSection({ risk }: { risk: RiskAssessment }) {
  const { t, lang } = useTranslation();
  const [activeRiskId, setActiveRiskId] = useState<number | null>(null);

  const riskItems: RiskFactor[] = Array.isArray(risk.riskFactors) && risk.riskFactors.length > 0
    ? risk.riskFactors
    : [
        { name: 'Working capital strain from credit sales', probability: 'HIGH', impact: 'HIGH', mitigation: 'Limit credit to 30% of sales; maintain credit register and enforce 15-day collection cycles.' },
        { name: 'Raw material price volatility', probability: 'HIGH', impact: 'MEDIUM', mitigation: 'Establish bulk procurement agreements with local farm suppliers.' },
        { name: 'Power supply disruption', probability: 'MEDIUM', impact: 'HIGH', mitigation: 'Budget for inverter setup or solar backup.' },
        { name: 'Competition from nearby haat markets', probability: 'MEDIUM', impact: 'MEDIUM', mitigation: 'Offer free doorstep delivery and custom ordering.' },
        { name: 'Equipment maintenance downtime', probability: 'LOW', impact: 'MEDIUM', mitigation: 'Perform monthly preventive maintenance servicing.' },
      ];

  const enriched = enrichRisks(riskItems);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 tracking-tight">
            <ShieldAlert className="h-5 w-5 text-rose-500" /> {t.risk?.title || 'Risk Assessment'} ({riskItems.length} Key Risks Analyzed)
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Business risk rating is calculated deterministically from loan equity ratio, margin of safety, and local operational constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Risk Index:</span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold shadow-xs ${riskColor[risk.riskRating] || 'bg-slate-100 text-slate-800'}`}
          >
            {risk.riskRating} · {formatIndianNumber(risk.overallRiskScore, lang)}/100
          </span>
        </div>
      </div>

      {/* Modern 3x3 Heatmap Matrix with Inspector */}
      <div>
        <RiskMatrixChart
          risks={riskItems}
          activeRiskId={activeRiskId}
          onSelectRisk={(id) => setActiveRiskId(id)}
        />
      </div>

      {/* Detailed Risk & Actionable Mitigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span>Detailed Mitigation & Control Protocols ({riskItems.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Numbered to match the matrix pins above
          </span>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {enriched.map((factor) => {
            const isHigh = factor.severityCategory === 'CRITICAL' || factor.severityCategory === 'HIGH';
            const isActive = activeRiskId === factor.id;

            return (
              <div
                id={`risk-card-${factor.id}`}
                key={`risk-card-${factor.id}`}
                onMouseEnter={() => setActiveRiskId(factor.id)}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : isHigh
                    ? 'border-rose-200 bg-rose-50/25 hover:border-rose-300 hover:shadow-xs'
                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Card Top: Number Pin & Category */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-start gap-2">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold flex-shrink-0 text-white shadow-xs ${
                        factor.severityCategory === 'CRITICAL'
                          ? 'bg-rose-600'
                          : factor.severityCategory === 'HIGH'
                          ? 'bg-orange-600'
                          : factor.severityCategory === 'MODERATE'
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                      }`}>
                        {factor.id}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {factor.name}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        factor.severityCategory === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : factor.severityCategory === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : factor.severityCategory === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {factor.severityCategory}
                      </span>
                    </div>
                  </div>

                  {/* Badges for P and I */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 mb-3 ml-8">
                    <span className="bg-slate-200/80 px-1.5 py-0.5 rounded">
                      Prob: <strong className="text-slate-900">{factor.pLevel}</strong>
                    </span>
                    <span>×</span>
                    <span className="bg-slate-200/80 px-1.5 py-0.5 rounded">
                      Impact: <strong className="text-slate-900">{factor.iLevel}</strong>
                    </span>
                    <span>=</span>
                    <span className="text-slate-700 font-mono">
                      {factor.severityScore}/9
                    </span>
                  </div>
                </div>

                {/* Mitigation section */}
                {factor.mitigation && (
                  <div className="mt-2 pt-2.5 border-t border-slate-200/80 text-xs">
                    <div className="font-bold text-teal-950 flex items-center gap-1 text-[11px] mb-1">
                      <ShieldCheck size={13} className="text-teal-700" />
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
      </div>
    </section>
  );
}

export { probabilityValue, impactValue };