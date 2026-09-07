'use client';

import { Sparkles, ThumbsUp, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import { decisionColor } from '@/lib/format';
import type { AiRecommendation } from '@/types';

export function AIRecommendationSection({ recommendation }: { recommendation: AiRecommendation }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-slate-900">AI Recommendation — Why?</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Every recommendation is explainable. Deterministic financial rules decide eligibility; AI only
        explains the results.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <ThumbsUp className="h-4 w-4 text-emerald-600" /> Strengths
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {(Array.isArray(recommendation.strengths) ? recommendation.strengths : []).map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Watch-outs
          </h3>
          <ul className="mt-3 space-y-2">
            {(Array.isArray(recommendation.weaknesses) ? recommendation.weaknesses : []).map((w) => (
              <li key={w} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Next best step</div>
          <div className="mt-1 flex items-start gap-2 text-sm">
            <ArrowRightCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            <span>{recommendation.recommendedNextStep}</span>
          </div>
        </div>
        <span
          className={`shrink-0 self-start rounded-full px-4 py-2 text-sm font-bold ${decisionColor[recommendation.decision]}`}
        >
          {recommendation.decision.replaceAll('_', ' ')}
        </span>
      </div>
    </section>
  );
}