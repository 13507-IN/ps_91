'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, CalendarRange } from 'lucide-react';
import type { ActionPlan } from '@/types';

export function ActionPlanSection({ plan }: { plan: ActionPlan }) {
  const storageKey = useMemo(() => 'ArthSetu-checklist', []);
  // Always start with an empty set so SSR and client produce identical markup.
  // Hydrate from sessionStorage after mount to avoid React hydration warning.
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) setDone(new Set<number>(JSON.parse(raw)));
    } catch {
      // storage unavailable — leave empty
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(Array.from(done)));
    } catch {
      // storage unavailable
    }
  }, [done, storageKey]);

  const progress = plan.fundingReadinessChecklist.length
    ? Math.round((done.size / plan.fundingReadinessChecklist.length) * 100)
    : 0;

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <CalendarRange className="h-5 w-5 text-brand-600" /> 30-Day Action Plan
        </h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          {plan.planDurationDays} days
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {plan.milestones.map((m, idx) => (
          <div key={m.phase} className="relative pl-5">
            {idx < plan.milestones.length - 1 && (
              <div className="absolute left-[5px] top-4 h-full w-0.5 bg-brand-100" />
            )}
            <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand-500 bg-white" />
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-800">{m.phase}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  {m.dayRange}
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {m.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ClipboardCheck className="h-4 w-4 text-brand-600" /> Funding Readiness Checklist
          </h3>
          <span className="text-sm font-bold text-brand-700">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ul className="mt-4 space-y-2">
          {plan.fundingReadinessChecklist.map((item, i) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-white">
                <input
                  type="checkbox"
                  checked={done.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span
                  className={`text-sm ${
                    done.has(i) ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}