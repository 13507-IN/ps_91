'use client';

import { FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import { FinancialPlan, DscrOutput } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { percent } from '@/lib/format';

interface PnLSummaryCardProps {
  plan: FinancialPlan;
}

export function PnLSummaryCard({ plan }: PnLSummaryCardProps) {
  const { lang } = useTranslation();

  const monthlyRevenue = plan.cashflow.projections[0]?.revenue || 78300;
  const monthlyOps = plan.cashflow.projections[0]?.operatingCosts || 38000;
  const monthlyEmi = plan.emi.emi || 3847;

  // Direct costs (COGS ~ 60%) vs Overhead (40%)
  const cogs = Math.round(monthlyOps * 0.6);
  const overhead = monthlyOps - cogs;

  const grossProfit = monthlyRevenue - cogs;
  const operatingSurplus = grossProfit - overhead; // EBITDA
  const netCashflow = operatingSurplus - monthlyEmi;

  const annualRevenue = monthlyRevenue * 12;
  const annualEmi = monthlyEmi * 12;
  const annualNetProfit = netCashflow * 12;

  // Calculate DSCR if not explicitly provided
  // DSCR = Operating Surplus / EMI
  const rawDscr = monthlyEmi > 0 ? Number((operatingSurplus / monthlyEmi).toFixed(2)) : 2.5;

  const dscrData: DscrOutput = plan.dscr || {
    dscr: rawDscr,
    status: rawDscr >= 1.5 ? 'EXCELLENT' : rawDscr >= 1.2 ? 'GOOD' : 'HIGH_RISK',
    benchmarkText:
      rawDscr >= 1.5
        ? `DSCR is ${rawDscr} (≥ 1.50). Excellent debt service coverage — highly acceptable for bank loan sanctions (MUDRA / PMEGP).`
        : rawDscr >= 1.2
        ? `DSCR is ${rawDscr} (1.20 - 1.50). Good debt coverage capability under baseline conditions.`
        : `DSCR is ${rawDscr} (< 1.20). Tight cashflow cushion; bank loan approval may require higher margin contribution.`,
  };

  const getDscrBadge = (status: DscrOutput['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
        };
      case 'GOOD':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-900',
          badge: 'bg-sky-600 text-white',
          icon: <ShieldCheck className="h-5 w-5 text-sky-600" />,
        };
      default:
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        };
    }
  };

  const dscrStyle = getDscrBadge(dscrData.status);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* DSCR Header & Bank Benchmark Box */}
      <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${dscrStyle.bg}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{dscrStyle.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Debt Service Coverage Ratio (DSCR)
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dscrStyle.badge}`}>
                {dscrData.status}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-snug">{dscrData.benchmarkText}</p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-white/80 rounded-lg p-2.5 border border-black/5 shadow-2xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">DSCR Value</div>
          <div className="text-xl font-black text-slate-900">{dscrData.dscr}x</div>
          <div className="text-[9px] text-slate-400">Benchmark: ≥ 1.50</div>
        </div>
      </div>

      {/* P&L Statement Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Profit & Loss (P&L) Statement Summary</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Pro-Forma Monthly & Annual</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Particulars</th>
                <th className="py-2.5 px-3 text-right">Monthly (₹)</th>
                <th className="py-2.5 px-3 text-right">Annualized (₹)</th>
                <th className="py-2.5 px-3 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="bg-slate-50/40 font-semibold text-slate-900">
                <td className="py-2.5 px-3">Gross Sales Revenue</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                  {formatIndianNumber(monthlyRevenue, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  {formatIndianNumber(annualRevenue, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right">100.0%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 pl-6 text-slate-600">Less: Cost of Goods Sold (COGS / Raw Materials)</td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  - {formatIndianNumber(cogs, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  - {formatIndianNumber(cogs * 12, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {percent(cogs / monthlyRevenue)}
                </td>
              </tr>
              <tr className="font-semibold text-slate-800 bg-slate-50/30">
                <td className="py-2 px-3">Gross Profit</td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">
                  {formatIndianNumber(grossProfit, lang, true)}
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">
                  {formatIndianNumber(grossProfit * 12, lang, true)}
                </td>
                <td className="py-2 px-3 text-right">{percent(grossProfit / monthlyRevenue)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 pl-6 text-slate-600">Less: Operating Expenses (Utilities, Labor, Rent)</td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  - {formatIndianNumber(overhead, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  - {formatIndianNumber(overhead * 12, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {percent(overhead / monthlyRevenue)}
                </td>
              </tr>
              <tr className="font-bold text-slate-900 bg-emerald-50/30">
                <td className="py-2.5 px-3">Operating Surplus / EBITDA</td>
                <td className="py-2.5 px-3 text-right text-emerald-800">
                  {formatIndianNumber(operatingSurplus, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-800">
                  {formatIndianNumber(operatingSurplus * 12, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right">{percent(operatingSurplus / monthlyRevenue)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 pl-6 text-slate-600">Less: Debt Service (Bank Loan EMI)</td>
                <td className="py-2.5 px-3 text-right text-amber-700">
                  - {formatIndianNumber(monthlyEmi, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right text-amber-700">
                  - {formatIndianNumber(annualEmi, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right">{percent(monthlyEmi / monthlyRevenue)}</td>
              </tr>
              <tr className="bg-emerald-100/70 font-extrabold text-emerald-950 text-sm border-t-2 border-emerald-300">
                <td className="py-3 px-3">Net Profit / Retained Cashflow</td>
                <td className="py-3 px-3 text-right text-emerald-900 font-black">
                  {formatIndianNumber(netCashflow, lang, true)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-900 font-black">
                  {formatIndianNumber(annualNetProfit, lang, true)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-900 font-black">
                  {percent(netCashflow / monthlyRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
