'use client';

import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

export interface MonthData {
  monthIndex: number;
  monthName: string;
  season: string;
  favorability: 'HIGH' | 'MODERATE' | 'LOW';
  favorabilityScore: number;
  demandIndex: number;
  priceIndex: number;
  events: string[];
  recommendedActivities: string[];
}

export function CalendarTimeline({ months }: { months: MonthData[] }) {
  return (
    <div className="space-y-4">
      {/* 12-month visual timeline strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
        {months.map((m) => {
          const isHigh = m.favorability === 'HIGH';
          const isLow = m.favorability === 'LOW';

          return (
            <div
              key={m.monthIndex}
              className={`p-3 rounded-xl border text-center transition-all ${
                isHigh
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                  : isLow
                    ? 'bg-rose-50/80 border-rose-200'
                    : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {m.monthName.slice(0, 3)}
              </div>
              
              <div className="my-1.5 flex justify-center">
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    isHigh
                      ? 'bg-emerald-600 text-white'
                      : isLow
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                  }`}
                >
                  {m.favorabilityScore}%
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-medium">
                {isHigh ? 'Peak' : isLow ? 'Lean' : 'Normal'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed month-by-month card list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {months.map((m) => {
          const isHigh = m.favorability === 'HIGH';
          const isLow = m.favorability === 'LOW';

          return (
            <div
              key={`card-${m.monthIndex}`}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-teal-800" />
                  <span className="font-bold text-slate-900 text-sm">{m.monthName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-emerald-100 text-emerald-800'
                      : isLow
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Demand: {(m.demandIndex * 100).toFixed(0)}%
                </span>
              </div>

              {m.events.length > 0 && (
                <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg font-medium flex items-start gap-1.5">
                  <Sparkles size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{m.events.join(', ')}</span>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-[11px] text-slate-500 uppercase">Recommended Actions:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {m.recommendedActivities.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
