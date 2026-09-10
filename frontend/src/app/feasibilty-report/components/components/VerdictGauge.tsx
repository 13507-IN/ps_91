'use client';

import { Doughnut } from 'react-chartjs-2';
import { gradeColor, clamp } from '@/lib/format';
import type { Grade } from '@/types';

const gradeColors: Record<Grade, string> = {
  EXCELLENT: '#10b981',
  GOOD: '#14b8a6',
  MODERATE: '#f59e0b',
  POOR: '#f43f5e',
};

export function VerdictGauge({ score, grade }: { score: number; grade: Grade }) {
  const value = clamp(score, 0, 100);
  const remaining = 100 - value;

  const chartData = {
    datasets: [
      {
        data: [value, remaining],
        backgroundColor: [gradeColors[grade], '#e2e8f0'],
        borderWidth: 0,
        hoverBorderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '78%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="relative inline-flex h-44 w-44 items-end justify-center">
      <div className="h-full w-full">
        <Doughnut data={chartData} options={options as any} />
      </div>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <div className="text-4xl font-bold text-slate-900">{value}</div>
        <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">/ 100</div>
      </div>
    </div>
  );
}
