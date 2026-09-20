'use client';

import { RefreshCw, Clock } from 'lucide-react';
import { WorkingCapitalOutput } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

interface WorkingCapitalCardProps {
  workingCapital: WorkingCapitalOutput;
}

export function WorkingCapitalCard({ workingCapital }: WorkingCapitalCardProps) {
  const { lang } = useTranslation();

  const inventoryDays = workingCapital.inventoryDays ?? 15;
  const receivableDays = workingCapital.receivableDays ?? 15;
  const payableDays = workingCapital.payableDays ?? 10;
  const operatingCycleDays = workingCapital.operatingCycleDays ?? Math.max(1, inventoryDays + receivableDays - payableDays);

  const dailyExpense = workingCapital.dailyExpense ?? (workingCapital.requiredWorkingCapital / 30);
  const baseWorkingCapital = workingCapital.baseWorkingCapital ?? (dailyExpense * operatingCycleDays);
  const bufferAmount = workingCapital.bufferAmount ?? (baseWorkingCapital * 0.1);
  const totalWorkingCapital = workingCapital.requiredWorkingCapital || (baseWorkingCapital + bufferAmount);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Working Capital & Operating Cycle Breakdown</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation of liquidity required to sustain day-to-day operations and inventory holding period
          </p>
        </div>

        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-right shrink-0">
          <div className="text-[10px] font-semibold uppercase text-indigo-700">Total Required Working Capital</div>
          <div className="text-base font-extrabold text-indigo-900">
            {formatIndianNumber(totalWorkingCapital, lang, true)}
          </div>
        </div>
      </div>

      {/* Operating Cycle Days Visual Formula */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-indigo-600" />
          Operating Cycle Formula
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg bg-white p-2.5 border border-slate-200">
            <div className="text-slate-500 text-[11px]">Inventory Days</div>
            <div className="text-sm font-bold text-slate-900">{formatIndianNumber(inventoryDays, lang)} Days</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Stock & Raw Material holding</div>
          </div>

          <div className="flex items-center justify-center font-bold text-slate-400 text-base">
            +
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-slate-200">
            <div className="text-slate-500 text-[11px]">Receivable Days</div>
            <div className="text-sm font-bold text-slate-900">{formatIndianNumber(receivableDays, lang)} Days</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Customer credit period</div>
          </div>

          <div className="flex items-center justify-center font-bold text-slate-400 text-base">
            -
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-slate-200">
            <div className="text-slate-500 text-[11px]">Payable Days</div>
            <div className="text-sm font-bold text-slate-900">{formatIndianNumber(payableDays, lang)} Days</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Supplier payment terms</div>
          </div>
        </div>

        <div className="mt-3 text-center rounded-lg bg-indigo-100/80 p-2 text-xs font-bold text-indigo-900 border border-indigo-200">
          Net Operating Cycle = {inventoryDays} + {receivableDays} - {payableDays} ={' '}
          <span className="text-sm underline">{operatingCycleDays} Days</span>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="py-2.5 px-3">Working Capital Line Item</th>
              <th className="py-2.5 px-3">Parameter / Basis</th>
              <th className="py-2.5 px-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-900">Daily Operating Expense</td>
              <td className="py-2.5 px-3 text-slate-500">Monthly Operating Costs ÷ 30 Days</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                {formatIndianNumber(dailyExpense, lang, true)} / day
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-900">Base Working Capital</td>
              <td className="py-2.5 px-3 text-slate-500">Daily Expense × {operatingCycleDays} Operating Cycle Days</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                {formatIndianNumber(baseWorkingCapital, lang, true)}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-900">Contingency Buffer (10%)</td>
              <td className="py-2.5 px-3 text-slate-500">Emergency reserve for price spikes & delays</td>
              <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                {formatIndianNumber(bufferAmount, lang, true)}
              </td>
            </tr>
            <tr className="bg-indigo-50/60 font-extrabold text-slate-900 border-t border-indigo-200">
              <td className="py-2.5 px-3 text-indigo-950">Total Recommended Working Capital</td>
              <td className="py-2.5 px-3 text-indigo-700 font-normal">Covers {workingCapital.monthsCovered || 3} months operating cushion</td>
              <td className="py-2.5 px-3 text-right text-indigo-900 font-black text-sm">
                {formatIndianNumber(totalWorkingCapital, lang, true)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
