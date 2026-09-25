'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { CalendarTimeline, type MonthData } from './components/CalendarTimeline';
import { PriceForecastChart } from './components/PriceForecastChart';

const CATEGORIES = [
  { value: 'DAIRY', label: 'Dairy & Milk Products' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing (Milling & Oil)' },
  { value: 'TEXTILES_TAILORING', label: 'Textiles & Handloom Weaving' },
  { value: 'POULTRY', label: 'Poultry & Livestock' },
  { value: 'RETAIL', label: 'Retail & Grocery' },
  { value: 'AGRICULTURE', label: 'Agricultural Services' },
  { value: 'HANDICRAFT', label: 'Handicrafts & Artisans' },
];

interface SeasonalCalendarResponse {
  bestMonthsToLaunch: string[];
  peakDemandMonths: string[];
  leanMonths: string[];
  months: MonthData[];
}

export default function SeasonalCalendarPage() {
  const [category, setCategory] = useState('DAIRY');
  const [district, setDistrict] = useState('Nadia');
  const [data, setData] = useState<SeasonalCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      try {
        const res = await api<SeasonalCalendarResponse>(
          `${apiEndpoints.market.intelligence.replace('/intelligence', '')}/seasonal-calendar?category=${category}&district=${district}`,
        );
        setData(res);
      } catch (err) {
        console.warn('Failed to load seasonal data, using local fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, [category, district]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#102347] via-[#1A3A6B] to-[#1E4A8A] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
              <Sparkles size={14} />
              Agricultural & Festive Cycle Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Seasonal Business Calendar
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Identify the best launch window, peak festive demand surges, raw material harvest discounts, and cashflow buffer strategies across 12 months.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Business Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">District:</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
            >
              <option value="Nadia">Nadia (Pilot District)</option>
              <option value="Murshidabad">Murshidabad</option>
              <option value="Hooghly">Hooghly</option>
              <option value="North 24 Parganas">North 24 Parganas</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#1A3A6B]" />
            <p className="text-xs">Computing 12-month agricultural & festive demand trends...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Quick Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Best Launch Months</div>
                <div className="text-lg font-extrabold text-emerald-950 mt-1">
                  {data.bestMonthsToLaunch.join(', ')}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Optimal timing to capture harvest liquidity and festive purchasing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">Peak Demand Periods</div>
                <div className="text-lg font-extrabold text-amber-950 mt-1">
                  {data.peakDemandMonths.join(', ') || 'Festive Season'}
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Surge in customer footfall and higher margins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-xs font-bold text-rose-800 uppercase tracking-wide">Lean Months (Plan Buffer)</div>
                <div className="text-lg font-extrabold text-rose-950 mt-1">
                  {data.leanMonths.join(', ') || 'Monsoon Season'}
                </div>
                <p className="text-[11px] text-rose-700 mt-1">
                  Maintain 30-day working capital buffer for EMI & fixed costs.
                </p>
              </div>
            </div>

            {/* Price vs Demand Forecast Chart */}
            <PriceForecastChart months={data.months} />

            {/* 12-Month Detailed Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">12-Month Operational Timeline & Milestones</h3>
              <CalendarTimeline months={data.months} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
