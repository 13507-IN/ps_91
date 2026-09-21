'use client';

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, TrendingDown, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Layers, Table, Sparkles } from 'lucide-react';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface QuarterlyAmortizationScheduleProps {
  initialPrincipal?: number;
  initialRate?: number;
  initialTenureMonths?: number;
  initialMoratoriumMonths?: number;
  className?: string;
}

interface QuarterRow {
  quarter: number;
  periodLabel: string;
  isMoratorium: boolean;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalInstallment: number;
  closingBalance: number;
}

export function QuarterlyAmortizationSchedule({
  initialPrincipal = 900000,
  initialRate = 8.0,
  initialTenureMonths = 84,
  initialMoratoriumMonths = 6,
  className = '',
}: QuarterlyAmortizationScheduleProps) {
  const { t, lang } = useTranslation();

  // State
  const [principal, setPrincipal] = useState<number>(initialPrincipal);
  const [annualRate, setAnnualRate] = useState<number>(initialRate);
  const [tenureMonths, setTenureMonths] = useState<number>(initialTenureMonths);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(initialMoratoriumMonths);
  const [activeView, setActiveView] = useState<'QUARTERLY' | 'MONTHLY'>('QUARTERLY');
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // Scheme Logic determination
  const isMicroFinance = principal <= 125000;
  
  // Math calculations
  const totalQuarters = Math.max(1, Math.round(tenureMonths / 3));
  const moratoriumQuarters = Math.max(0, Math.round(moratoriumMonths / 3));
  const activeRepaymentQuarters = Math.max(1, totalQuarters - moratoriumQuarters);
  
  const quarterlyRate = (annualRate / 100) / 4;
  
  // Calculate standard quarterly EMI for active period
  let activeQuarterlyEmi = 0;
  if (quarterlyRate > 0 && activeRepaymentQuarters > 0) {
    const factor = Math.pow(1 + quarterlyRate, activeRepaymentQuarters);
    activeQuarterlyEmi = (principal * quarterlyRate * factor) / (factor - 1);
  } else {
    activeQuarterlyEmi = principal / activeRepaymentQuarters;
  }

  // Generate Quarter-by-Quarter Schedule
  const schedule: QuarterRow[] = [];
  let currentBalance = principal;
  let totalInterestSca = 0;
  let totalPrincipalPaid = 0;

  for (let q = 1; q <= totalQuarters; q++) {
    const startMonth = (q - 1) * 3 + 1;
    const endMonth = q * 3;
    const periodLabel = `Mo ${startMonth}–${endMonth}`;
    const isMoratorium = q <= moratoriumQuarters;

    const opening = currentBalance;
    let interest = Math.round(opening * quarterlyRate);
    let principalPart = 0;
    let installment = 0;

    if (isMoratorium) {
      principalPart = 0;
      installment = interest; // Interest-only during moratorium
      // Balance remains unchanged
    } else {
      installment = Math.round(activeQuarterlyEmi);
      // For last quarter, adjust rounding discrepancies
      if (q === totalQuarters || installment > opening + interest) {
        principalPart = opening;
        installment = principalPart + interest;
        currentBalance = 0;
      } else {
        principalPart = Math.min(opening, Math.max(0, installment - interest));
        currentBalance = Math.max(0, opening - principalPart);
      }
    }

    totalInterestSca += interest;
    totalPrincipalPaid += principalPart;

    schedule.push({
      quarter: q,
      periodLabel,
      isMoratorium,
      openingBalance: opening,
      principalPaid: principalPart,
      interestPaid: interest,
      totalInstallment: installment,
      closingBalance: currentBalance,
    });
  }

  // Commercial / MFI Comparison (at typical 24% p.a. MFI rate with 0 moratorium)
  const commercialAnnualRate = 24.0;
  const commercialMonthlyRate = (commercialAnnualRate / 100) / 12;
  const commercialFactor = Math.pow(1 + commercialMonthlyRate, tenureMonths);
  const commercialMonthlyEmi = (principal * commercialMonthlyRate * commercialFactor) / (commercialFactor - 1);
  const commercialTotalInterest = Math.max(0, commercialMonthlyEmi * tenureMonths - principal);
  const totalInterestSaved = Math.max(0, commercialTotalInterest - totalInterestSca);

  // Rows to display (first 4 quarters, then toggled for full list)
  const displayedRows = showAllRows ? schedule : schedule.slice(0, 6);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-800 text-white shadow-2xs">
              <Calendar className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Official Moratorium & Quarterly Repayment Timeline
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Compliant with <strong>SCA Guidelines</strong> — includes {moratoriumMonths}-Month Setup Grace Period & quarterly debt service.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('QUARTERLY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'QUARTERLY'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarterly (SCA Standard)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'MONTHLY'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Cashflow View
          </button>
        </div>
      </div>

      {/* 3-Stage Visual Lifecycle Progress */}
      <div className="rounded-xl border border-brand-200/80 bg-brand-50/40 p-4">
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Layers size={14} className="text-brand-700" />
          <span>Loan Lifecycle Stages & Moratorium Protection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage 1: Moratorium */}
          <div className="relative rounded-xl bg-amber-50/90 border border-amber-300/80 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                Stage 1: Grace Moratorium
              </span>
              <span className="text-xs font-black text-amber-900 font-mono">
                Months 1–{moratoriumMonths}
              </span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              Machinery Setup & Zero Principal
            </div>
            <p className="mt-1 text-[11px] text-amber-950 leading-relaxed">
              <strong>Principal Paid = ₹0</strong>. Pay only small quarterly interest (~{formatIndianNumber(schedule[0]?.interestPaid || 0, lang, true)}/qtr). Focus 100% on installing equipment and securing initial customers.
            </p>
          </div>

          {/* Stage 2: Active Repayment */}
          <div className="relative rounded-xl bg-teal-50/90 border border-teal-300/80 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-200 text-teal-950 uppercase">
                Stage 2: Active Debt Service
              </span>
              <span className="text-xs font-black text-teal-950 font-mono">
                Quarters {moratoriumQuarters + 1}–{totalQuarters}
              </span>
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              Equal Quarterly Installments
            </div>
            <p className="mt-1 text-[11px] text-teal-950 leading-relaxed">
              <strong>{formatIndianNumber(activeQuarterlyEmi, lang, true)} / quarter</strong> (~{formatIndianNumber(activeQuarterlyEmi / 3, lang, true)}/mo). Repaid from ongoing business cashflows as production scales up.
            </p>
          </div>

          {/* Stage 3: Full Ownership */}
          <div className="relative rounded-xl bg-emerald-50/90 border border-emerald-300/80 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-emerald-950 uppercase">
                Stage 3: 100% Debt Free
              </span>
              <CheckCircle2 size={16} className="text-emerald-700" />
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              Asset & Machinery Ownership
            </div>
            <p className="mt-1 text-[11px] text-emerald-950 leading-relaxed">
              All machinery and shop assets become 100% unencumbered. All subsequent operational profits directly build net worth and family savings.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards: Concessional Savings & Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Sanctioned Loan</span>
          <div className="mt-1 text-base font-black text-slate-900 font-mono">
            {formatIndianNumber(principal, lang, true)}
          </div>
          <span className="text-[10px] text-slate-400">90% of project cost</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">
            {activeView === 'QUARTERLY' ? 'Quarterly Installment' : 'Monthly Cashflow Budget'}
          </span>
          <div className="mt-1 text-base font-black text-teal-800 font-mono">
            {activeView === 'QUARTERLY'
              ? `${formatIndianNumber(activeQuarterlyEmi, lang, true)}/qtr`
              : `${formatIndianNumber(activeQuarterlyEmi / 3, lang, true)}/mo`}
          </div>
          <span className="text-[10px] text-slate-400">After {moratoriumMonths}mo grace</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total SCA Interest</span>
          <div className="mt-1 text-base font-black text-slate-900 font-mono">
            {formatIndianNumber(totalInterestSca, lang, true)}
          </div>
          <span className="text-[10px] text-slate-400">@ {annualRate}% concessional p.a.</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
          <span className="text-[10px] text-emerald-800 uppercase font-bold block">Interest Saved vs MFIs</span>
          <div className="mt-1 text-base font-black text-emerald-900 font-mono">
            {formatIndianNumber(totalInterestSaved, lang, true)}
          </div>
          <span className="text-[10px] text-emerald-700">vs 24% p.a. private credit</span>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Table size={14} className="text-teal-800" />
            <span>
              {activeView === 'QUARTERLY' ? 'Quarter-by-Quarter Repayment Schedule' : 'Monthly Normalized Cashflow Schedule'}
            </span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Total {totalQuarters} Quarters ({tenureMonths} Months)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">
                  {activeView === 'QUARTERLY' ? 'Quarter' : 'Period'}
                </th>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Opening (₹)</th>
                <th className="py-2.5 px-3 text-right">Principal (₹)</th>
                <th className="py-2.5 px-3 text-right">Interest (₹)</th>
                <th className="py-2.5 px-3 text-right font-black text-slate-900">
                  {activeView === 'QUARTERLY' ? 'Installment (₹)' : 'Monthly Equiv. (₹)'}
                </th>
                <th className="py-2.5 px-3 text-right">Closing (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedRows.map((row) => (
                <tr
                  key={`q-row-${row.quarter}`}
                  className={`transition-colors ${
                    row.isMoratorium
                      ? 'bg-amber-50/40 hover:bg-amber-50/70'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {activeView === 'QUARTERLY' ? `Q${row.quarter}` : `Q${row.quarter} (3 Mos)`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {row.periodLabel}
                  </td>
                  <td className="py-2.5 px-3">
                    {row.isMoratorium ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock size={10} /> Grace Moratorium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-950 border border-teal-200">
                        <CheckCircle2 size={10} className="text-teal-700" /> Active Repayment
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {formatIndianNumber(row.openingBalance, lang, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
                    {row.isMoratorium ? (
                      <span className="text-amber-800 font-bold">₹0 (Grace)</span>
                    ) : (
                      formatIndianNumber(activeView === 'QUARTERLY' ? row.principalPaid : row.principalPaid / 3, lang, true)
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {formatIndianNumber(activeView === 'QUARTERLY' ? row.interestPaid : row.interestPaid / 3, lang, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-teal-800">
                    {formatIndianNumber(activeView === 'QUARTERLY' ? row.totalInstallment : row.totalInstallment / 3, lang, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    {formatIndianNumber(row.closingBalance, lang, true)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td colSpan={4} className="py-2.5 px-3">
                  Total Lifetime Loan Servicing ({totalQuarters} Quarters)
                </td>
                <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                  {formatIndianNumber(principal, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right font-black text-slate-700 font-mono">
                  {formatIndianNumber(totalInterestSca, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right font-black text-teal-800 font-mono">
                  {formatIndianNumber(principal + totalInterestSca, lang, true)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700">₹0 (Paid Off)</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* View All Rows Button */}
        {schedule.length > 6 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAllRows(!showAllRows)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            >
              {showAllRows
                ? `Collapse Schedule (Show First 6 Quarters)`
                : `View Complete ${totalQuarters}-Quarter (${tenureMonths} Months) Repayment Schedule`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
