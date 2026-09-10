'use client';

import { Bar } from 'react-chartjs-2';
import { chartDefaults, formatINR } from '@/lib/chart-setup';
import { riskColor } from '@/lib/format';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { StressTestOutput } from '@/types';

export function StressTestChart({ stressTest }: { stressTest: StressTestOutput }) {
  const scenarios = Array.isArray(stressTest.scenarios) ? stressTest.scenarios : [];

  const data = scenarios.map((s) => ({
    name: String(s.name ?? 'Scenario').replaceAll('_', ' '),
    postEmiCashflow: Number(s.monthlyNetCashflow ?? 0),
  }));

  const rawTest = stressTest as unknown as Record<string, unknown>;
  const overallRisk =
    (typeof rawTest.overallRiskLevel === 'string' ? rawTest.overallRiskLevel : null) ??
    (stressTest.base?.canServiceDebt ? 'LOW' : 'MEDIUM');

  const colors = data.map((d) =>
    d.postEmiCashflow >= 0
      ? 'rgba(30, 146, 117, 0.85)'
      : 'rgba(244, 63, 94, 0.85)',
  );
  const hoverColors = data.map((d) =>
    d.postEmiCashflow >= 0 ? 'rgba(30, 146, 117, 1)' : 'rgba(244, 63, 94, 1)',
  );

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Post-EMI Cashflow',
        data: data.map((d) => d.postEmiCashflow),
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const val = ctx.parsed.y ?? 0;
            return `Cashflow: ${formatINR(val)}${val < 0 ? ' (cannot service EMI)' : ''}`;
          },
        },
      },
    },
    scales: {
      ...chartDefaults.scales,
      x: {
        ...chartDefaults.scales.x,
        ticks: {
          ...chartDefaults.scales.x.ticks,
          maxRotation: 25,
          minRotation: 0,
          font: { size: 10, family: 'Inter, sans-serif' },
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
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Stress Test — Post-EMI Cash Flow</h4>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor[overallRisk] ?? 'bg-slate-100 text-slate-700'}`}
        >
          Risk: {overallRisk}
        </span>
      </div>
      <div className="h-60 w-full">
        <Bar data={chartData} options={options} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Red bars mean the business cannot cover its EMI under that scenario.
      </p>
    </div>
  );
}