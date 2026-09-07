'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { inr } from '@/lib/format';

interface EmiSimulatorProps {
  initialPrincipal: number;
  initialRate: number;
  initialTenure: number;
}

function calculate(counts: {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  moratoriumType: 'INTEREST_ONLY' | 'NO_PAYMENT';
}) {
  const { principal, annualRate, tenureMonths, moratoriumMonths, moratoriumType } = counts;
  const r = annualRate / 12 / 100;
  const schedule: { month: number; principal: number; interest: number; balance: number }[] = [];
  let emi = 0;

  if (r > 0 && tenureMonths > 0) {
    const n = tenureMonths;
    emi =
      n >= 1
        ? Math.round(
            (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1),
          )
        : principal;

    let balance = principal;
    for (let i = 0; i < tenureMonths; i++) {
      const interest = Math.round(balance * r);
      if (i < moratoriumMonths && moratoriumType === 'NO_PAYMENT') {
        balance = balance + interest;
        schedule.push({
          month: i + 1,
          principal: 0,
          interest,
          balance: Math.round(balance),
        });
        continue;
      }
      if (i < moratoriumMonths && moratoriumType === 'INTEREST_ONLY') {
        schedule.push({ month: i + 1, principal: 0, interest, balance: Math.round(balance) });
        continue;
      }
      const principalPart = i < moratoriumMonths ? 0 : emi - interest;
      balance = balance - principalPart;
      schedule.push({
        month: i + 1,
        principal: Math.max(0, principalPart),
        interest,
        balance: Math.max(0, Math.round(balance)),
      });
    }
  } else {
    emi = Math.round(principal / Math.max(1, tenureMonths) || principal);
  }

  const totalInterest = schedule.reduce((acc, r) => acc + r.interest, 0);
  return { emi, totalInterest, totalPayment: emi * tenureMonths + totalInterest, schedule };
}

const PERIOD_OPTIONS = [12, 24, 36, 48, 60, 84, 120];

export function EmiSimulator({ initialPrincipal, initialRate, initialTenure }: EmiSimulatorProps) {
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState(initialRate);
  const [tenure, setTenure] = useState(initialTenure);
  const [moratorium, setMoratorium] = useState(0);
  const [moratoriumType, setMoratoriumType] = useState<'INTEREST_ONLY' | 'NO_PAYMENT'>('INTEREST_ONLY');

  // Slider max must be >= initialPrincipal to avoid React "value out of range" warning.
  const sliderMax = Math.max(1000000, Math.ceil(initialPrincipal / 50000) * 50000);

  const result = calculate({
    principal,
    annualRate,
    tenureMonths: tenure,
    moratoriumMonths: moratorium,
    moratoriumType,
  });

  const shown = result.schedule.filter((row) => row.month <= 12 || row.month > tenure - 12);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <SlidersHorizontal className="h-4 w-4" /> EMI Simulator
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label-base">Loan amount</label>
          <input
            type="range"
            min={100000}
            max={sliderMax}
            step={50000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="text-sm font-semibold text-slate-900">{inr(principal)}</div>
        </div>
        <div>
          <label className="label-base">Interest rate ({annualRate}% p.a.)</label>
          <input
            type="range"
            min={5}
            max={16}
            step={0.25}
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>
        <div>
          <label className="label-base">Tenure</label>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTenure(m)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  tenure === m
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                {m % 12 === 0 ? `${m / 12}yr` : `${m} mo`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-base">Moratorium (months)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={12}
              value={moratorium}
              onChange={(e) => setMoratorium(Number(e.target.value))}
              className="input-base"
            />
            <select
              className="input-base"
              value={moratoriumType}
              onChange={(e) => setMoratoriumType(e.target.value as never)}
              disabled={moratorium === 0}
            >
              <option value="INTEREST_ONLY">Interest only</option>
              <option value="NO_PAYMENT">No payment</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Monthly EMI</div>
          <div className="mt-1 text-lg font-bold text-brand-700">
            {inr(result.emi)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Total interest</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{inr(result.totalInterest)}</div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Total payment</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{inr(result.totalPayment)}</div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">Month</th>
              <th className="py-2 pr-4 font-medium">Principal</th>
              <th className="py-2 pr-4 font-medium">Interest</th>
              <th className="py-2 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.month} className="border-b border-slate-100">
                <td className="py-1.5 pr-4 text-slate-600">{row.month}</td>
                <td className="py-1.5 pr-4">{inr(row.principal)}</td>
                <td className="py-1.5 pr-4">{inr(row.interest)}</td>
                <td className="py-1.5">{inr(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length < result.schedule.length && (
          <p className="mt-2 text-[11px] text-slate-400">
            Showing first and last 12 of {result.schedule.length} months.
          </p>
        )}
      </div>
    </div>
  );
}