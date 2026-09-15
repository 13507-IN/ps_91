'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import '@/lib/chart-setup';
import type { ChartOptions } from 'chart.js';
import type { MonthData } from './CalendarTimeline';

export function PriceForecastChart({ months }: { months: MonthData[] }) {
  const labels = months.map((m) => m.monthName.slice(0, 3));
  const demandData = months.map((m) => Number((m.demandIndex * 100).toFixed(0)));
  const priceData = months.map((m) => Number((m.priceIndex * 100).toFixed(0)));

  const data = {
    labels,
    datasets: [
      {
        label: 'Demand Index (%)',
        data: demandData,
        borderColor: '#0D4E49',
        backgroundColor: 'rgba(13, 78, 73, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#0D4E49',
      },
      {
        label: 'Mandi Price Index (%)',
        data: priceData,
        borderColor: '#E65C00',
        backgroundColor: 'rgba(230, 92, 0, 0.05)',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#E65C00',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: 'bold' as const },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}% of baseline`,
        },
      },
    },
    scales: {
      y: {
        min: 40,
        max: 200,
        ticks: {
          callback: (value) => `${value}%`,
          font: { size: 10 },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' as const } },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div>
        <h4 className="font-bold text-slate-900 text-sm">12-Month Demand vs. Wholesale Price Forecast</h4>
        <p className="text-xs text-slate-500">Projected seasonality benchmarked against 100% annual baseline</p>
      </div>
      <div className="h-64 sm:h-72 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
