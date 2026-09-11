'use client';

import { Landmark, Wallet, ArrowDown, ExternalLink } from 'lucide-react';
import { FinancialPlan } from '@/types';
import { inr, inrCompact, percent } from '@/lib/format';
import { EmiSimulator } from './EmiSimulator';
import { CashflowChart } from './CashflowChart';
import { BreakEvenChart } from './BreakEvenChart';
import { StressTestChart } from './StressTestChart';

export function FinancialPlanSection({ plan, schemeNames }: { plan: FinancialPlan; schemeNames: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Financial Plan</h2>
      <p className="mt-1 text-xs text-slate-500">
        Deterministic calculations from the scheme rule engine — shown as a bridge from your margin to
        the loan.
      </p>

      {/* Capital bridge */}
      <div className="mt-5 grid grid-cols-3 items-center gap-2 text-center">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Wallet className="h-3.5 w-3.5" /> Your margin
          </div>
          <div className="mt-1 text-xl font-bold text-brand-700">{inrCompact(plan.availableCapital)}</div>
          <div className="text-[11px] text-slate-400">{percent(plan.marginPercentage)} of project</div>
        </div>
        <ArrowDown className="mx-auto h-5 w-5 text-slate-400" />
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Landmark className="h-3.5 w-3.5" /> Loan required
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{inrCompact(plan.loanRequired)}</div>
          <div className="text-[11px] text-slate-400">net {inrCompact(plan.netLoanAmount)}</div>
        </div>
      </div>

      {/* Matched scheme */}
      <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wide text-brand-800">Top Recommended Scheme</div>
          {schemeNames.length > 0 && (
            <div className="rounded-full bg-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
              {schemeNames.length} Match{schemeNames.length > 1 ? 'es' : ''}
            </div>
          )}
        </div>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div className="text-base font-semibold text-slate-900">{plan.matchedSchemeName}</div>
          {plan.matchedSchemeUrl && (
            <a
              href={plan.matchedSchemeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
            >
              Apply Now <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="text-xs text-slate-500">Interest</div>
            <div className="text-sm font-bold text-slate-900">{percent(plan.interestRate)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Tenure</div>
            <div className="text-sm font-bold text-slate-900">{plan.tenureMonths} months</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Subsidy</div>
            <div className="text-sm font-bold text-slate-900">{inr(plan.subsidyAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Monthly EMI</div>
            <div className="text-sm font-bold text-brand-700">{inr(plan.emi.emi)}</div>
          </div>
        </div>
        {schemeNames.length > 1 && (
          <div className="mt-4 border-t border-brand-200/60 pt-3">
            <div className="text-[11px] font-medium uppercase text-brand-700">Alternative Options</div>
            <p className="mt-1 text-xs text-slate-600">{schemeNames.filter(n => n !== plan.matchedSchemeName).join(' · ')}</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <EmiSimulator
          initialPrincipal={plan.netLoanAmount}
          initialRate={plan.interestRate}
          initialTenure={plan.tenureMonths}
        />
        <CashflowChart cashflow={plan.cashflow} />
        <BreakEvenChart breakeven={plan.breakEven} />
        <StressTestChart stressTest={plan.stressTest} />
      </div>
    </section>
  );
}