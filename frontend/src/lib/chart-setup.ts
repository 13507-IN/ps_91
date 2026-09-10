'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { font: { size: 11, family: 'Inter, sans-serif' }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleFont: { size: 12, family: 'Inter, sans-serif' },
      bodyFont: { size: 12, family: 'Inter, sans-serif' },
      padding: 10,
      cornerRadius: 8,
      displayColors: true,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#64748b' },
      border: { display: false },
    },
    y: {
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#64748b' },
      border: { display: false },
    },
  },
};

export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}
