'use client';

import type { RiskFactor } from '@/types';

const axisLabels = ['Low', 'Medium', 'High'];
const colorFor = (p: number, i: number) => {
  const score = p * i;
  if (score >= 7) return '#f43f5e';
  if (score >= 4) return '#f59e0b';
  return '#10b981';
};

export function RiskMatrixChart({ risks }: { risks: RiskFactor[] }) {
  const points = risks.map((r) => {
    const p = { LOW: 0.5, MEDIUM: 1.5, HIGH: 2.5 }[r.probability] ?? 1.5;
    const i = { LOW: 0.5, MEDIUM: 1.5, HIGH: 2.5 }[r.impact] ?? 1.5;
    return { ...r, p, i };
  });

  return (
    <div className="min-w-[420px]">
      <div className="relative h-64 w-full">
        {/* heat background */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              'linear-gradient(to top left, rgba(16,185,129,0.15), rgba(245,158,11,0.15), rgba(244,63,94,0.15))',
          }}
        />
        {/* grid */}
        <svg className="absolute inset-0 h-full w-full">
          {[0.5, 1.5, 2.5].map((v) => (
            <line
              key={`v${v}`}
              x1={0}
              x2="100%"
              y1={((2.5 - v) / 2.5) * 100 + '%'}
              y2={((2.5 - v) / 2.5) * 100 + '%'}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {[0.5, 1.5, 2.5].map((v) => (
            <line
              key={`h${v}`}
              x1={((v - 0.5) / 2.5) * 100 + '%'}
              x2={((v - 0.5) / 2.5) * 100 + '%'}
              y1={0}
              y2="100%"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </svg>
        {/* points */}
        {points.map((point) => (
          <div
            key={point.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(point.p / 3) * 100}%`,
              top: `${100 - (point.i / 3) * 100}%`,
            }}
            title={`${point.name} — P:${point.probability} I:${point.impact}`}
          >
            <span
              className="block h-4 w-4 rounded-full border-2 border-white shadow"
              style={{ background: colorFor(point.p, point.i) }}
            />
          </div>
        ))}
        {/* axes */}
        <div className="absolute bottom-1 left-4 text-[10px] text-slate-400">Low impact</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] text-slate-400">
          Impact →
        </div>
        <div className="absolute bottom-[2px] right-2 text-[10px] text-slate-400">Probability →</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {points.map((point) => (
          <span key={`legend-${point.name}`} className="inline-flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: colorFor(point.p, point.i) }}
            />
            {point.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export { axisLabels };