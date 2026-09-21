'use client';

import React, { useState } from 'react';
import { Wallet, ShieldCheck, Info, Sparkles } from 'lucide-react';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SmartSchemeCalculatorProps {
  initialCapital?: number;
  onApplyCapital?: (newCapital: number) => void;
  className?: string;
}

export function SmartSchemeCalculator({ initialCapital = 50000, onApplyCapital, className = '' }: SmartSchemeCalculatorProps) {
  const { lang } = useTranslation();
  const [marginInput, setMarginInput] = useState<number>(initialCapital);

  // Financial Structuring calculations (10% Margin -> 100% Project Cost -> 90% Loan)
  const marginAmount = Math.max(5000, Number(marginInput) || 0);
  const totalProjectCost = marginAmount * 10; // Project Cost = Available Margin / 10%
  
  // Scheme Auto-Selection Rules:
  // Logic A: Project Cost <= 1.40 Lakh -> Micro Finance Scheme (6.5% interest, 3-yr tenure, 3-month moratorium, max loan 1.25L)
  // Logic B: Project Cost > 1.40 Lakh & <= 50.00 Lakh -> Term Loan Scheme (8.0% interest, 7-yr tenure, 6-month moratorium, max loan 45L)
  const isMicroFinance = totalProjectCost <= 140000;
  
  let eligibleLoanAmount = totalProjectCost * 0.90; // 90% of Project Cost
  let interestRate = 6.5;
  let tenureYears = 3;
  let moratoriumMonths = 3;
  let schemeName = 'SCA Micro Finance Scheme (Logic A)';
  let schemeTag = 'Micro Finance Tier (≤ ₹1.40L)';

  if (isMicroFinance) {
    eligibleLoanAmount = Math.min(eligibleLoanAmount, 125000);
    interestRate = 6.5;
    tenureYears = 3;
    moratoriumMonths = 3;
    schemeName = 'State Channelizing Agency (SCA) Micro Finance Scheme';
    schemeTag = 'Logic A: Micro Finance (≤ ₹1.40 Lakh Project)';
  } else {
    eligibleLoanAmount = Math.min(eligibleLoanAmount, 4500000);
    interestRate = 8.0;
    tenureYears = 7;
    moratoriumMonths = 6;
    schemeName = 'State Channelizing Agency (SCA) Term Loan Scheme';
    schemeTag = 'Logic B: Term Loan Scheme (₹1.40L – ₹50.00L Project)';
  }

  // Quarterly Repayment Estimation factoring Moratorium
  // Total repayment quarters = (tenureYears * 4) - (moratoriumMonths / 3)
  const totalQuarters = tenureYears * 4;
  const moratoriumQuarters = Math.ceil(moratoriumMonths / 3);
  const activeRepaymentQuarters = totalQuarters - moratoriumQuarters;
  
  const quarterlyRate = (interestRate / 100) / 4;
  let estimatedQuarterlyEmi = 0;
  if (quarterlyRate > 0 && activeRepaymentQuarters > 0) {
    const factor = Math.pow(1 + quarterlyRate, activeRepaymentQuarters);
    estimatedQuarterlyEmi = (eligibleLoanAmount * quarterlyRate * factor) / (factor - 1);
  }
  const estimatedMonthlyEquivalent = estimatedQuarterlyEmi / 3;

  const quickAmounts = [10000, 14000, 50000, 100000, 200000, 500000];

  return (
    <div className={`rounded-2xl border border-brand-200/80 bg-gradient-to-br from-white via-brand-50/30 to-teal-50/40 p-4 sm:p-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-100/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-700 text-white shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Smart Scheme & Capital Structuring Engine
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Auto-calculates <strong>10% Margin $\rightarrow$ 90% Concessional SCA Loan</strong> and routes to <strong>Logic A vs Logic B</strong> scheme tiers.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-bold shrink-0 border border-brand-200">
          <ShieldCheck className="h-4 w-4 text-brand-700" />
          <span>SCA 10:90 Standard</span>
        </div>
      </div>

      {/* Interactive Capital Selector */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Wallet size={14} className="text-brand-700" />
            <span>Your Available Margin Capital (10% Self Contribution)</span>
          </label>
          <span className="text-sm font-black text-brand-800 font-mono">
            {formatIndianNumber(marginAmount, lang, true)}
          </span>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={`calc-chip-${amt}`}
              type="button"
              onClick={() => {
                setMarginInput(amt);
                if (onApplyCapital) onApplyCapital(amt);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                marginAmount === amt
                  ? 'bg-brand-700 text-white shadow-xs scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              {formatIndianNumber(amt, lang, true)}
              {amt === 14000 && <span className="ml-1 text-[10px] text-amber-300 font-normal"> (Max Micro)</span>}
              {amt === 100000 && <span className="ml-1 text-[10px] text-teal-200 font-normal"> (PS Example)</span>}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={marginAmount}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMarginInput(val);
              if (onApplyCapital) onApplyCapital(val);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
          />
          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
            <span>₹10,000 (Min Setup)</span>
            <span>₹14,000 (Logic A Threshold)</span>
            <span>₹5,00,000 (₹50 Lakh Project)</span>
          </div>
        </div>
      </div>

      {/* 3-Part Financial Bridge & Scheme Routing Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Promoter Margin (10%) */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>1. Your 10% Contribution</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">Mandatory Margin</span>
          </div>
          <div className="mt-2 text-xl font-black text-brand-800 font-mono">
            {formatIndianNumber(marginAmount, lang, true)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Deposited into your bank account as initial promoter stake.
          </p>
        </div>

        {/* 2. Total Business Setup (100% Project Cost) */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-brand-900 uppercase tracking-wide flex items-center justify-between">
            <span>2. Total Project Cost (10x)</span>
            <span className="px-1.5 py-0.5 rounded bg-brand-200 text-brand-950 text-[10px]">100% Setup</span>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 font-mono">
            {formatIndianNumber(totalProjectCost, lang, true)}
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            Includes machinery, tools, electrical fittings & initial working capital.
          </p>
        </div>

        {/* 3. SCA Concessional Loan (90%) */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center justify-between">
            <span>3. Concessional Loan (90%)</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 text-[10px]">SCA Financed</span>
          </div>
          <div className="mt-2 text-xl font-black text-emerald-900 font-mono">
            {formatIndianNumber(eligibleLoanAmount, lang, true)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-800">
            Directly sanctioned by SCA at concessional {interestRate}% rate.
          </p>
        </div>
      </div>

      {/* Auto-Selected Scheme Routing Outcome */}
      <div className="mt-4 rounded-xl border border-brand-300 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isMicroFinance ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
              }`}>
                {schemeTag}
              </span>
              <span className="text-xs text-slate-400 font-medium">• Auto-Selected via PS-91 Logic</span>
            </div>
            <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
              {schemeName}
            </h4>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Estimated Quarterly Repayment</div>
            <div className="text-base font-black text-brand-700 font-mono">
              {formatIndianNumber(estimatedQuarterlyEmi, lang, true)} <span className="text-xs font-normal text-slate-500">/ quarter</span>
            </div>
            <div className="text-[10px] text-slate-400">
              (~{formatIndianNumber(estimatedMonthlyEquivalent, lang, true)} / month equivalent)
            </div>
          </div>
        </div>

        {/* 4 Feature Parameter Pills */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Concessional Rate</span>
            <strong className="text-sm text-slate-900 font-black">{interestRate}% p.a.</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Total Tenure</span>
            <strong className="text-sm text-slate-900 font-black">{tenureYears} Years ({tenureYears * 12} Mos)</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
            <span className="text-[10px] text-teal-800 block">Moratorium Grace Period</span>
            <strong className="text-sm text-teal-950 font-black">{moratoriumMonths} Months Grace</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Promoter Margin</span>
            <strong className="text-sm text-brand-700 font-black">10% (₹{formatIndianNumber(marginAmount, lang)})</strong>
          </div>
        </div>

        {/* Moratorium Explanation Note */}
        <div className="mt-3 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-[11px] text-teal-950 flex items-start gap-2">
          <Info size={15} className="text-teal-700 shrink-0 mt-0.5" />
          <div>
            <strong>Moratorium Protection:</strong> During the first <strong>{moratoriumMonths} months</strong>, no principal repayment is required. This gives you peace of mind to procure machinery, set up the shop, and generate revenue before installments begin.
          </div>
        </div>
      </div>
    </div>
  );
}
