'use client';

import { Bar } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { FeasibilityScore } from '@/types';

const dimensions = [
  { key: 'marketDemandScore' as const, label: 'Market Demand', color: 'rgba(16, 185, 129, 0.85)', hover: 'rgba(16, 185, 129, 1)' },
  { key: 'competitionScore' as const, label: 'Competition', color: 'rgba(14, 165, 233, 0.85)', hover: 'rgba(14, 165, 233, 1)' },
  { key: 'financialViabilityScore' as const, label: 'Financial Viability', color: 'rgba(245, 158, 11, 0.85)', hover: 'rgba(245, 158, 11, 1)' },
  { key: 'capitalAdequacyScore' as const, label: 'Capital Adequacy', color: 'rgba(139, 92, 246, 0.85)', hover: 'rgba(139, 92, 246, 1)' },
  { key: 'riskResilienceScore' as const, label: 'Risk Resilience', color: 'rgba(244, 63, 94, 0.85)', hover: 'rgba(244, 63, 94, 1)' },
];

function getScoreColor(value: number): string {
  if (value >= 14) return 'bg-emerald-500';
  if (value >= 8) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function ScoreBreakdownChart({ score }: { score: FeasibilityScore }) {
  const chartData = {
    labels: dimensions.map((d) => d.label),
    datasets: [
      {
        label: 'Score',
        data: dimensions.map((d) => score[d.key]),
        backgroundColor: dimensions.map((d) => d.color),
        hoverBackgroundColor: dimensions.map((d) => d.hover),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => `${ctx.parsed.x} / 20`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 20,
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#64748b', stepSize: 5 },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#334155', padding: 4 },
      },
    },
  };

  return (
    <div className="space-y-3">
      <div className="h-[180px] w-full">
        <Bar data={chartData} options={options} />
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
        <div className="w-full space-y-2">
          {dimensions.map(({ key, label }) => {
            const value = score[key];
            const color = getScoreColor(value);
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{label}</span>
                  <span className="font-semibold text-white">{value}/20</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${(value / 20) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="sm:ml-6 shrink-0 text-left sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
          <span className="text-xs sm:text-sm font-medium text-slate-300">Total Score</span>
          <div className="text-base sm:text-lg font-bold">
            {score.totalScore}
            <span className="ml-1 text-xs font-normal text-slate-400">/ 100 · {score.grade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}