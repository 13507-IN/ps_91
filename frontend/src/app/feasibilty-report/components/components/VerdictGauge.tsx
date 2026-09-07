'use client';

import { gradeColor, clamp } from '@/lib/format';
import type { Grade } from '@/types';

export function VerdictGauge({ score, grade }: { score: number; grade: Grade }) {
  const value = clamp(score, 0, 100);
  const r = 74;
  const circumference = Math.PI * r; // semicircle
  const filled = (value / 100) * circumference;

  return (
    <div className="relative inline-flex h-44 w-44 items-end justify-center">
      <svg viewBox="0 0 168 92" className="h-full w-full">
        <path
          d="M 10 84 A 74 74 0 0 1 158 84"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 10 84 A 74 74 0 0 1 158 84"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className={gradeColor[grade]}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-4xl font-bold text-slate-900">{value}</div>
        <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">/ 100</div>
      </div>
    </div>
  );
}