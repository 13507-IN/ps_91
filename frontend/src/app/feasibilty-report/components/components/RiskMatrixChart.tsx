'use client';

import { Scatter } from 'react-chartjs-2';
import { chartDefaults } from '@/lib/chart-setup';
import type { RiskFactor } from '@/types';

const toNum = (v: number | string): number => {
  if (typeof v === 'number') return v;
  return { LOW: 0.3, MEDIUM: 0.6, HIGH: 0.9 }[v] ?? 0.5;
};

const colorFor = (p: number, i: number) => {
  const score = p * i;
  if (score >= 0.5) return '#f43f5e';
  if (score >= 0.25) return '#f59e0b';
  return '#10b981';
};

export function RiskMatrixChart({ risks }: { risks: RiskFactor[] }) {
  const points = risks.map((r) => {
    const p = toNum(r.probability);
    const i = toNum(r.impact);
    return { ...r, p, i };
  });

  const chartData = {
    datasets: [
      {
        label: 'Risk Factors',
        data: points.map((pt) => ({ x: pt.p, y: pt.i })),
        backgroundColor: points.map((pt) => colorFor(pt.p, pt.i)),
        borderColor: points.map((pt) => colorFor(pt.p, pt.i)),
        borderWidth: 2,
        pointRadius: 10,
        pointHoverRadius: 14,
        pointStyle: 'circle' as const,
      },
    ],
  };

  const options = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          title: (items: any) => {
            const idx = items[0].dataIndex;
            return points[idx]?.name ?? '';
          },
          label: (ctx: any) => {
            const pt = points[ctx.dataIndex];
            return [`Probability: ${(pt.p * 100).toFixed(0)}%`, `Impact: ${(pt.i * 100).toFixed(0)}%`];
          },
          afterLabel: (ctx: any) => {
            const pt = points[ctx.dataIndex];
            return pt.mitigation ? `Mitigation: ${pt.mitigation}` : '';
          },
        },
      },
    },
    scales: {
      x: {
        ...chartDefaults.scales.x,
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Probability →',
          font: { size: 11, family: 'Inter, sans-serif', weight: '500' as const },
          color: '#64748b',
        },
        ticks: {
          ...chartDefaults.scales.x.ticks,
          callback: (v: any) => {
            if (v === 0) return 'Low';
            if (v === 0.5) return 'Medium';
            if (v === 1) return 'High';
            return '';
          },
        },
      },
      y: {
        ...chartDefaults.scales.y,
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Impact →',
          font: { size: 11, family: 'Inter, sans-serif', weight: '500' as const },
          color: '#64748b',
        },
        ticks: {
          ...chartDefaults.scales.y.ticks,
          callback: (v: any) => {
            if (v === 0) return 'Low';
            if (v === 0.5) return 'Medium';
            if (v === 1) return 'High';
            return '';
          },
        },
      },
    },
  };

  return (
    <div className="min-w-[420px]">
      <div className="h-64 w-full">
        <Scatter data={chartData} options={options as any} />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {points.map((point, idx) => (
          <span key={`legend-${idx}`} className="inline-flex items-center gap-1">
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
