'use client';

import { Calendar, Sun, Sparkles, Info } from 'lucide-react';
import { SeasonalMonthInfo } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

interface SeasonalHeatmapCardProps {
  seasonalData?: SeasonalMonthInfo[];
  baseMonthlyRevenue?: number;
}

export function SeasonalHeatmapCard({ seasonalData, baseMonthlyRevenue = 78300 }: SeasonalHeatmapCardProps) {
  const { lang } = useTranslation();

  const defaultSeasonal: SeasonalMonthInfo[] = [
    { monthIndex: 0, monthName: 'Jan', multiplier: 1.15, status: 'PEAK', reason: 'Winter harvest & festival sweets' },
    { monthIndex: 1, monthName: 'Feb', multiplier: 1.10, status: 'PEAK', reason: 'Wedding season demand' },
    { monthIndex: 2, monthName: 'Mar', multiplier: 1.00, status: 'NORMAL', reason: 'Steady baseline' },
    { monthIndex: 3, monthName: 'Apr', multiplier: 0.95, status: 'NORMAL', reason: 'Early summer transition' },
    { monthIndex: 4, monthName: 'May', multiplier: 0.88, status: 'LEAN', reason: 'Summer heat slowdown' },
    { monthIndex: 5, monthName: 'Jun', multiplier: 0.82, status: 'LEAN', reason: 'Monsoon onset dip' },
    { monthIndex: 6, monthName: 'Jul', multiplier: 0.85, status: 'LEAN', reason: 'Monsoon rainfall' },
    { monthIndex: 7, monthName: 'Aug', multiplier: 0.95, status: 'NORMAL', reason: 'Festival prep starts' },
    { monthIndex: 8, monthName: 'Sep', multiplier: 1.05, status: 'NORMAL', reason: 'Pre-festive surge' },
    { monthIndex: 9, monthName: 'Oct', multiplier: 1.25, status: 'PEAK', reason: 'Durga Puja peak sales' },
    { monthIndex: 10, monthName: 'Nov', multiplier: 1.20, status: 'PEAK', reason: 'Diwali & post-harvest boom' },
    { monthIndex: 11, monthName: 'Dec', multiplier: 1.15, status: 'PEAK', reason: 'Year-end & winter peak' },
  ];

  const months = seasonalData && seasonalData.length === 12 ? seasonalData : defaultSeasonal;

  const getStatusBg = (status: SeasonalMonthInfo['status'], multiplier: number) => {
    if (status === 'PEAK' || multiplier >= 1.1) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70';
    }
    if (status === 'LEAN' || multiplier <= 0.9) {
      return 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70';
    }
    return 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/70';
  };

  const getBadgeColor = (status: SeasonalMonthInfo['status'], multiplier: number) => {
    if (status === 'PEAK' || multiplier >= 1.1) {
      return 'bg-emerald-600 text-white';
    }
    if (status === 'LEAN' || multiplier <= 0.9) {
      return 'bg-amber-600 text-white';
    }
    return 'bg-slate-200 text-slate-700';
  };

  const peakMonthsCount = months.filter((m) => m.status === 'PEAK' || m.multiplier >= 1.1).length;
  const leanMonthsCount = months.filter((m) => m.status === 'LEAN' || m.multiplier <= 0.9).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Seasonal Revenue Calendar & Heatmap</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Expected monthly revenue fluctuations based on harvesting seasons, climate, and festival demand cycles
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
          <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-emerald-800">
            <Sparkles className="h-3 w-3" /> Peak ({peakMonthsCount} mo)
          </span>
          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
            Normal ({12 - peakMonthsCount - leanMonthsCount} mo)
          </span>
          <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-amber-800">
            <Sun className="h-3 w-3" /> Lean ({leanMonthsCount} mo)
          </span>
        </div>
      </div>

      {/* 12-Month Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {months.map((m) => {
          const projectedRev = Math.round(baseMonthlyRevenue * m.multiplier);
          return (
            <div
              key={m.monthIndex}
              className={`rounded-xl border p-3 transition-all duration-150 flex flex-col justify-between ${getStatusBg(
                m.status,
                m.multiplier
              )}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">{m.monthName}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getBadgeColor(m.status, m.multiplier)}`}>
                    {(m.multiplier * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 text-sm font-extrabold">{formatIndianNumber(projectedRev, lang, true)}</div>
              </div>

              <div className="mt-2 border-t border-black/5 pt-1.5 text-[10px] text-slate-600 line-clamp-2 leading-tight">
                {m.reason}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seasonal Insight Box */}
      <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-brand-50/70 p-3 border border-brand-100 text-xs text-brand-900">
        <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Seasonal Risk & Buffer Strategy:</span> Revenue peaks during festival and harvest season (Oct–Feb) reaching up to 125% of baseline. During lean summer/monsoon months (May–Jul), revenue drops to ~82–88%. Working capital buffer of 3 months covers EMI and fixed expenses during lean months comfortably.
        </div>
      </div>
    </div>
  );
}
