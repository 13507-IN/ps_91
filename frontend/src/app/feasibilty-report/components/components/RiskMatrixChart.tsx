'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import type { RiskFactor } from '@/types';

// Standardized mapping
export const getLevel = (v: number | string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  if (typeof v === 'string') {
    const u = v.toUpperCase();
    if (u === 'HIGH' || u === 'H') return 'HIGH';
    if (u === 'LOW' || u === 'L') return 'LOW';
    return 'MEDIUM';
  }
  if (v >= 0.66 || v === 3) return 'HIGH';
  if (v <= 0.33 || v === 1) return 'LOW';
  return 'MEDIUM';
};

const levelValue = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export interface EnrichedRisk extends RiskFactor {
  id: number;
  pLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  iLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  pValue: number;
  iValue: number;
  severityScore: number; // 1 to 9
  severityCategory: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export function enrichRisks(risks: RiskFactor[]): EnrichedRisk[] {
  return risks.map((r, idx) => {
    const pLevel = getLevel(r.probability);
    const iLevel = getLevel(r.impact);
    const pValue = levelValue[pLevel];
    const iValue = levelValue[iLevel];
    const severityScore = pValue * iValue;

    let severityCategory: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (severityScore >= 6) {
      severityCategory = pLevel === 'HIGH' && iLevel === 'HIGH' ? 'CRITICAL' : 'HIGH';
    } else if (severityScore >= 4) {
      severityCategory = 'MODERATE';
    } else {
      severityCategory = 'LOW';
    }

    return {
      ...r,
      id: idx + 1,
      pLevel,
      iLevel,
      pValue,
      iValue,
      severityScore,
      severityCategory,
    };
  });
}

// Cell styling configuration for 3x3 matrix (row: Impact [3,2,1], col: Prob [1,2,3])
const CELL_CONFIG: Record<string, { bg: string; border: string; label: string; sublabel: string; badgeColor: string }> = {
  // Impact 3 (High)
  '1-3': { bg: 'bg-amber-50/70', border: 'border-amber-200', label: 'Moderate', sublabel: 'Low Prob · High Impact', badgeColor: 'text-amber-700 bg-amber-100' },
  '2-3': { bg: 'bg-orange-50/80', border: 'border-orange-200', label: 'High Priority', sublabel: 'Med Prob · High Impact', badgeColor: 'text-orange-800 bg-orange-100' },
  '3-3': { bg: 'bg-rose-50/90', border: 'border-rose-300 ring-1 ring-rose-300/50', label: 'Critical Risk', sublabel: 'High Prob · High Impact', badgeColor: 'text-rose-800 bg-rose-100' },
  
  // Impact 2 (Medium)
  '1-2': { bg: 'bg-emerald-50/60', border: 'border-emerald-200', label: 'Low / Manageable', sublabel: 'Low Prob · Med Impact', badgeColor: 'text-emerald-700 bg-emerald-100' },
  '2-2': { bg: 'bg-amber-50/80', border: 'border-amber-200', label: 'Moderate', sublabel: 'Med Prob · Med Impact', badgeColor: 'text-amber-700 bg-amber-100' },
  '3-2': { bg: 'bg-orange-50/80', border: 'border-orange-200', label: 'High Priority', sublabel: 'High Prob · Med Impact', badgeColor: 'text-orange-800 bg-orange-100' },
  
  // Impact 1 (Low)
  '1-1': { bg: 'bg-emerald-50/80', border: 'border-emerald-200 ring-1 ring-emerald-200/50', label: 'Safe Zone', sublabel: 'Low Prob · Low Impact', badgeColor: 'text-emerald-800 bg-emerald-100' },
  '2-1': { bg: 'bg-emerald-50/60', border: 'border-emerald-200', label: 'Low Risk', sublabel: 'Med Prob · Low Impact', badgeColor: 'text-emerald-700 bg-emerald-100' },
  '3-1': { bg: 'bg-amber-50/70', border: 'border-amber-200', label: 'Moderate', sublabel: 'High Prob · Low Impact', badgeColor: 'text-amber-700 bg-amber-100' },
};

interface RiskMatrixChartProps {
  risks: RiskFactor[];
  activeRiskId?: number | null;
  onSelectRisk?: (riskId: number) => void;
}

export function RiskMatrixChart({ risks, activeRiskId, onSelectRisk }: RiskMatrixChartProps) {
  const enriched = enrichRisks(risks);
  const [selectedPin, setSelectedPin] = useState<EnrichedRisk | null>(
    enriched.find((r) => r.id === activeRiskId) || null
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Metrics summary
  const criticalCount = enriched.filter((r) => r.severityCategory === 'CRITICAL').length;
  const highCount = enriched.filter((r) => r.severityCategory === 'HIGH').length;
  const moderateCount = enriched.filter((r) => r.severityCategory === 'MODERATE').length;
  const lowCount = enriched.filter((r) => r.severityCategory === 'LOW').length;

  const handlePinClick = (risk: EnrichedRisk) => {
    setSelectedPin(risk);
    if (onSelectRisk) {
      onSelectRisk(risk.id);
    }
  };

  const filteredRisks = filterSeverity === 'ALL'
    ? enriched
    : enriched.filter((r) => r.severityCategory === filterSeverity);

  return (
    <div className="w-full space-y-4">
      {/* ── Summary Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="text-slate-500 font-medium">Filter Matrix:</span>
          
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({enriched.length})
          </button>

          {criticalCount > 0 && (
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                filterSeverity === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Critical ({criticalCount})
            </button>
          )}

          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterSeverity === 'HIGH'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            High ({highCount})
          </button>

          <button
            onClick={() => setFilterSeverity('MODERATE')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterSeverity === 'MODERATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Moderate ({moderateCount})
          </button>

          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filterSeverity === 'LOW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Low ({lowCount})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <Info size={13} className="text-slate-400" />
          <span>Click any pin to inspect mitigation plan</span>
        </div>
      </div>

      {/* ── 3x3 Heatmap Matrix Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* The Matrix Canvas */}
        <div className="lg:col-span-8 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          
          <div className="flex">
            {/* Y-Axis Label (Impact) */}
            <div className="flex flex-col items-center justify-between py-6 pr-3 select-none">
              <span className="text-[11px] font-bold tracking-wider text-rose-700 uppercase rotate-[-90deg] whitespace-nowrap">
                High
              </span>
              <div className="flex flex-col items-center gap-1 my-auto">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider rotate-[-90deg] whitespace-nowrap">
                  Impact →
                </span>
                <span className="text-[10px] text-slate-400 font-medium rotate-[-90deg]">
                  (প্রভাব / प्रभाव)
                </span>
              </div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase rotate-[-90deg] whitespace-nowrap">
                Low
              </span>
            </div>

            {/* 3x3 Grid Matrix */}
            <div className="flex-1 space-y-2">
              {/* Rows (Impact 3 down to 1) */}
              {[3, 2, 1].map((impactRow) => (
                <div key={`row-${impactRow}`} className="grid grid-cols-3 gap-2 min-h-[95px] sm:min-h-[105px]">
                  {/* Columns (Probability 1 to 3) */}
                  {[1, 2, 3].map((probCol) => {
                    const key = `${probCol}-${impactRow}`;
                    const config = CELL_CONFIG[key];
                    const cellRisks = filteredRisks.filter(
                      (r) => r.pValue === probCol && r.iValue === impactRow
                    );

                    return (
                      <div
                        key={key}
                        className={`relative rounded-xl border p-2 flex flex-col justify-between transition-all duration-200 ${config.bg} ${config.border} hover:shadow-xs`}
                      >
                        {/* Cell Background Watermark */}
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pointer-events-none select-none">
                          <span className="truncate max-w-[80px] sm:max-w-none text-[9px] sm:text-[10px] uppercase font-bold tracking-tight opacity-75">
                            {config.label}
                          </span>
                          <span className="text-[9px] text-slate-400/80 font-tabular font-mono">
                            {impactRow * probCol}/9
                          </span>
                        </div>

                        {/* Pins in this cell */}
                        <div className="my-auto flex flex-wrap gap-1.5 py-1 z-10">
                          {cellRisks.map((risk) => {
                            const isSelected = selectedPin?.id === risk.id;
                            const isCritical = risk.severityCategory === 'CRITICAL';
                            const isHigh = risk.severityCategory === 'HIGH';

                            let pinBg = 'bg-emerald-600 text-white';
                            if (isCritical) pinBg = 'bg-rose-600 text-white ring-2 ring-rose-400';
                            else if (isHigh) pinBg = 'bg-orange-600 text-white';
                            else if (risk.severityCategory === 'MODERATE') pinBg = 'bg-amber-600 text-white';

                            return (
                              <motion.button
                                key={`pin-${risk.id}`}
                                onClick={() => handlePinClick(risk)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${pinBg} ${
                                  isSelected
                                    ? 'ring-4 ring-offset-1 ring-blue-500 shadow-md scale-105'
                                    : 'hover:opacity-90'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-extrabold">
                                  {risk.id}
                                </span>
                                <span className="truncate max-w-[70px] sm:max-w-[95px] text-[11px] font-semibold text-left">
                                  {risk.name}
                                </span>
                              </motion.button>
                            );
                          })}

                          {cellRisks.length === 0 && (
                            <div className="w-full text-center py-2 text-[10px] text-slate-300 font-medium select-none">
                              —
                            </div>
                          )}
                        </div>

                        {/* Subtitle tag */}
                        <div className="text-[8px] sm:text-[9px] text-slate-400 truncate select-none">
                          {config.sublabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* X-Axis Label (Probability) */}
              <div className="pt-2">
                <div className="grid grid-cols-3 text-center text-xs font-bold text-slate-600">
                  <span className="text-emerald-700">Low</span>
                  <div className="flex flex-col items-center">
                    <span className="uppercase tracking-wider text-[11px] text-slate-700 font-bold">
                      Probability →
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (সম্ভাবনা / संभावना)
                    </span>
                  </div>
                  <span className="text-rose-700">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Risk Inspector Card ── */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Risk Factor Inspector</span>
            {selectedPin && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedPin.severityCategory === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800'
                  : selectedPin.severityCategory === 'HIGH'
                  ? 'bg-orange-100 text-orange-800'
                  : selectedPin.severityCategory === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedPin.severityCategory}
              </span>
            )}
          </h3>

          <AnimatePresence mode="wait">
            {selectedPin ? (
              <motion.div
                key={`inspector-${selectedPin.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3.5"
              >
                {/* Title */}
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold flex-shrink-0 text-white shadow-xs ${
                    selectedPin.severityCategory === 'CRITICAL'
                      ? 'bg-rose-600'
                      : selectedPin.severityCategory === 'HIGH'
                      ? 'bg-orange-600'
                      : selectedPin.severityCategory === 'MODERATE'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}>
                    {selectedPin.id}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedPin.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                      <span>Prob: <strong className="text-slate-800">{selectedPin.pLevel}</strong></span>
                      <span>•</span>
                      <span>Impact: <strong className="text-slate-800">{selectedPin.iLevel}</strong></span>
                      <span>•</span>
                      <span>Severity: <strong className="text-slate-800">{selectedPin.severityScore}/9</strong></span>
                    </div>
                  </div>
                </div>

                {/* Severity Meter */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-600">Exposure Severity Index</span>
                    <span className="text-slate-900">{selectedPin.severityScore} of 9</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedPin.severityCategory === 'CRITICAL'
                          ? 'bg-rose-600'
                          : selectedPin.severityCategory === 'HIGH'
                          ? 'bg-orange-500'
                          : selectedPin.severityCategory === 'MODERATE'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(selectedPin.severityScore / 9) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Mitigation */}
                {selectedPin.mitigation && (
                  <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-100">
                    <div className="text-[11px] font-bold text-teal-950 flex items-center gap-1.5 mb-1">
                      <ShieldCheck size={14} className="text-teal-700" />
                      Actionable Mitigation Strategy
                    </div>
                    <p className="text-xs text-teal-900/90 leading-relaxed font-medium">
                      {selectedPin.mitigation}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    const el = document.getElementById(`risk-card-${selectedPin.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-teal-500', 'ring-offset-2');
                      setTimeout(() => {
                        el.classList.remove('ring-4', 'ring-teal-500', 'ring-offset-2');
                      }, 2000);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  <span>Highlight Full Action Plan Below</span>
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <AlertTriangle size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">Click any risk badge on the matrix to view its mitigation parameters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}