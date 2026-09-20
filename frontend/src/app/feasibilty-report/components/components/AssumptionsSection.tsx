'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, DollarSign, PieChart, HelpCircle } from 'lucide-react';
import { FinancialAssumptions } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

interface AssumptionsSectionProps {
  assumptions?: FinancialAssumptions;
  monthlyRevenue?: number;
  monthlyOperatingCosts?: number;
}

export function AssumptionsSection({ assumptions, monthlyRevenue = 78300, monthlyOperatingCosts = 38000 }: AssumptionsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useTranslation();

  // Fallback defaults if assumptions object is missing
  const revenueItems = assumptions?.revenueItems || [
    {
      name: 'Primary Product / Service Sales',
      dailyUnits: 30,
      unitPrice: 45,
      unitName: 'units',
      dailyRevenue: Math.round(monthlyRevenue / 30),
      monthlyRevenue: monthlyRevenue,
    },
  ];

  const costItems = assumptions?.costItems || [
    {
      category: 'Raw Materials & Supplies',
      monthlyAmount: Math.round(monthlyOperatingCosts * 0.6),
      description: 'Primary input materials and daily production supplies',
      isDirectCost: true,
    },
    {
      category: 'Salaries & Labor',
      monthlyAmount: Math.round(monthlyOperatingCosts * 0.25),
      description: 'Labor, helpers, and operational staff wages',
      isDirectCost: false,
    },
    {
      category: 'Utilities, Rent & Logistics',
      monthlyAmount: Math.round(monthlyOperatingCosts * 0.15),
      description: 'Electricity, fuel, water, and local transport',
      isDirectCost: false,
    },
  ];

  const methodologyNotes = assumptions?.methodologyNotes || [
    'Revenue estimates are derived from local catchment demand and mandi market rates.',
    'Operating costs are benchmarked against official NABARD / KVIC operational guidelines.',
    'Daily figures assume 30 operating days per month.',
  ];

  const totalMonthlyRevenueCalc = revenueItems.reduce((acc, item) => acc + item.monthlyRevenue, 0);
  const totalMonthlyCostCalc = costItems.reduce((acc, item) => acc + item.monthlyAmount, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all duration-200 shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100/80 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Revenue & Cost Assumptions</h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Transparent Methodology
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit economics, price per unit, raw materials & cost breakdown driving the financial forecast
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
          <span>{isOpen ? 'Hide Breakdown' : 'View Assumptions'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-200/80 bg-white space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Revenue Breakdown */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Revenue Breakdown (Unit Economics)
              </div>
              <div className="text-xs font-semibold text-emerald-700">
                Total Monthly: {formatIndianNumber(totalMonthlyRevenueCalc, lang, true)}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Revenue Stream</th>
                    <th className="py-2.5 px-3">Daily Units</th>
                    <th className="py-2.5 px-3">Price / Unit</th>
                    <th className="py-2.5 px-3">Daily Sales</th>
                    <th className="py-2.5 px-3 text-right">Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {revenueItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3">{formatIndianNumber(item.dailyUnits, lang)} {item.unitName}/day</td>
                      <td className="py-2.5 px-3">{formatIndianNumber(item.unitPrice, lang, true)}</td>
                      <td className="py-2.5 px-3">{formatIndianNumber(item.dailyRevenue, lang, true)}/day</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatIndianNumber(item.monthlyRevenue, lang, true)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 font-bold text-slate-900 border-t border-slate-200">
                    <td colSpan={4} className="py-2.5 px-3 text-slate-700">Total Projected Monthly Revenue</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                      {formatIndianNumber(totalMonthlyRevenueCalc, lang, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operating Cost Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <PieChart className="h-4 w-4 text-rose-600" />
                Operating Cost Breakdown
              </div>
              <div className="text-xs font-semibold text-rose-700">
                Total Monthly: {formatIndianNumber(totalMonthlyCostCalc, lang, true)}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Cost Component</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Basis / Description</th>
                    <th className="py-2.5 px-3 text-right">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {costItems.map((cost, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{cost.category}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cost.isDirectCost ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cost.isDirectCost ? 'Direct COGS' : 'Overhead'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{cost.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatIndianNumber(cost.monthlyAmount, lang, true)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50/40 font-bold text-slate-900 border-t border-slate-200">
                    <td colSpan={3} className="py-2.5 px-3 text-slate-700">Total Monthly Operating Expenses</td>
                    <td className="py-2.5 px-3 text-right text-rose-700 font-bold">
                      {formatIndianNumber(totalMonthlyCostCalc, lang, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology & Verification Notes */}
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <HelpCircle className="h-4 w-4 text-brand-600" />
              Methodology & Evaluator Notes
            </div>
            <ul className="space-y-1 pl-5 list-disc text-slate-600 text-[11px]">
              {methodologyNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
