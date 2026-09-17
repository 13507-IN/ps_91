import React from 'react';
import { CalendarRange } from 'lucide-react';
import type { ActionPlan } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';

export function ActionPlanSection({ plan }: { plan: ActionPlan }) {
  const { t, lang } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <CalendarRange className="h-5 w-5 text-brand-600" /> {t.actionPlan.title}
        </h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          {formatIndianNumber(plan.planDurationDays, lang)} days
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

    </section>
  );
}