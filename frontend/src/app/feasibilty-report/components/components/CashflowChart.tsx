'use client';

import { Chart } from 'react-chartjs-2';
import { chartDefaults, formatINR } from '@/lib/chart-setup';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { CashflowOutput } from '@/types';

export function CashflowChart({ cashflow }: { cashflow: CashflowOutput }) {
  const rawCashflow = cashflow as unknown as Record<string, unknown>;
  const rows = Array.isArray(cashflow.projections)
    ? cashflow.projections
    : Array.isArray(rawCashflow.monthlyCashflow)
      ? (rawCashflow.monthlyCashflow as Array<Record<string, number>>)
      : [];
  const data = rows.map((row) => ({
    name: `M${row.month}`,
    revenue: row.revenue,
    operatingCosts: row.operatingCosts,
    netCashflow: row.netCashflow,
  }));

  const labels = data.map((d) => d.name);

  const chartData: ChartData<'bar' | 'line', number[]> = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
        data: data.map((d) => d.revenue),
        backgroundColor: 'rgba(30, 146, 117, 0.85)',
        hoverBackgroundColor: 'rgba(30, 146, 117, 1)',
        borderRadius: 6,
        borderSkipped: false,
        order: 2,
      },
      {
        type: 'bar',
        label: 'Operating Costs',
        data: data.map((d) => d.operatingCosts),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        hoverBackgroundColor: 'rgba(245, 158, 11, 1)',
        borderRadius: 6,
        borderSkipped: false,
        order: 3,
      },
      {
        type: 'line',
        label: 'Net Cashflow',
        data: data.map((d) => d.netCashflow),
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#0f172a',
        tension: 0.3,
        fill: true,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx: TooltipItem<'bar' | 'line'>) => `${ctx.dataset.label}: ${formatINR(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      ...chartDefaults.scales,
      x: {
        ...chartDefaults.scales.x,
        stacked: false,
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
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">12-Month Cash Flow Projection</h4>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            cashflow.isCashflowPositive
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {cashflow.isCashflowPositive ? 'Positive' : 'At Risk'}
        </span>
      </div>
      <div className="h-72 w-full">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
}