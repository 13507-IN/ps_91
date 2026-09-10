'use client';

import { Line } from 'react-chartjs-2';
import { chartDefaults, formatINR } from '@/lib/chart-setup';
import { inrCompact } from '@/lib/format';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { BreakEvenOutput } from '@/types';

export function BreakEvenChart({ breakeven }: { breakeven: BreakEvenOutput }) {
  const maxUnits = Math.max(breakeven.breakEvenUnits * 1.6, 10);
  const safeUnits = Math.max(breakeven.breakEvenUnits, 1);
  const price = breakeven.breakEvenRevenue / safeUnits;
  const unitCost = (breakeven.breakEvenRevenue / safeUnits) * 0.65;
  const fixedCosts = breakeven.breakEvenRevenue - safeUnits * unitCost;

  const data = Array.from({ length: 12 }, (_, i) => {
    const units = Math.round((i / 11) * maxUnits);
    const revenue = Math.round(units * price);
    const totalCost = Math.round(fixedCosts + units * unitCost);
    return { name: units.toLocaleString('en-IN'), revenue, totalCost };
  });

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((d) => d.revenue),
        borderColor: '#1e9275',
        backgroundColor: 'rgba(30, 146, 117, 0.08)',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#1e9275',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Total Cost',
        data: data.map((d) => d.totalCost),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.06)',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#f43f5e',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => `${items[0].label} units`,
          label: (ctx: TooltipItem<'line'>) => `${ctx.dataset.label}: ${formatINR(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      ...chartDefaults.scales,
      x: {
        ...chartDefaults.scales.x,
        title: {
          display: true,
          text: 'Units',
          font: { size: 11, family: 'Inter, sans-serif', weight: 500 },
          color: '#64748b',
        },
      },
      y: {
        ...chartDefaults.scales.y,
        ticks: {
          ...chartDefaults.scales.y.ticks,
          callback: (v: string | number) => formatINR(Number(v)),
        },
      },
    },
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-700">Break-Even Analysis</h4>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            breakeven.isViable
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {breakeven.isViable ? 'Viable' : 'Not viable'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Break-even units</div>
          <div className="text-lg font-bold text-slate-900">
            {breakeven.breakEvenUnits.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Break-even revenue</div>
          <div className="text-lg font-bold text-slate-900">{inrCompact(breakeven.breakEvenRevenue)}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Break-even Month</div>
          <div className="text-lg font-bold text-slate-900">{breakeven.breakEvenMonth ? `Month ${breakeven.breakEvenMonth}` : 'N/A'}</div>
        </div>
      </div>
      <div className="relative mt-3 h-56 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}