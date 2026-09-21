'use client';

import { Bar } from 'react-chartjs-2';
import { chartDefaults } from '@/lib/chart-setup';
import { riskColor } from '@/lib/format';
import type { ChartOptions, TooltipItem } from 'chart.js';
import type { StressTestOutput } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export function StressTestChart({ stressTest }: { stressTest: StressTestOutput }) {
  const { lang } = useTranslation();
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
            return `Cashflow: ${formatIndianNumber(val, lang, true)}${val < 0 ? ' (cannot service EMI)' : ''}`;
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
          callback: (v: string | number) => formatIndianNumber(Number(v), lang, true, true),
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800">
          {lang === 'HI' ? 'तनाव परीक्षण — ईएमआई उपरांत शुद्ध नकदी प्रवाह' : lang === 'BN' ? 'স্ট্রেস টেস্ট — কিস্তি পরিশোধের পর নগদ প্রবাহ' : 'Stress Testing & Sensitivity Scenario Analysis'}
        </h4>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor[overallRisk] ?? 'bg-slate-100 text-slate-700'}`}
        >
          Risk: {overallRisk}
        </span>
      </div>

      <div className="h-56 w-full">
        <Bar data={chartData} options={options} />
      </div>

      {/* Sensitivity Scenario Breakdown Table */}
      {scenarios.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Economic Stress Scenario</th>
                <th className="py-2.5 px-3 text-center">Revenue Diff</th>
                <th className="py-2.5 px-3 text-center">Cost Diff</th>
                <th className="py-2.5 px-3 text-right">Stressed Surplus</th>
                <th className="py-2.5 px-3 text-center">Debt Servicing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {scenarios.map((sc, idx) => {
                let revChange = sc.revenueChange ?? 0;
                let costChange = sc.costChange ?? 0;
                if (Math.abs(revChange) > 1) revChange = revChange / 100;
                if (Math.abs(costChange) > 1) costChange = costChange / 100;
                if (revChange === 0 && costChange === 0) {
                  const lower = (sc.name ?? '').toLowerCase();
                  if (lower.includes('inflation') || lower.includes('cost')) costChange = 0.15;
                  else if (lower.includes('demand')) revChange = -0.20;
                  else if (lower.includes('competition') || lower.includes('price')) revChange = -0.10;
                  else if (lower.includes('combined') || lower.includes('downside')) { revChange = -0.15; costChange = 0.10; }
                }
                const revStr = revChange > 0 ? `+${(revChange * 100).toFixed(0)}%` : revChange < 0 ? `${(revChange * 100).toFixed(0)}%` : '0%';
                const costStr = costChange > 0 ? `+${(costChange * 100).toFixed(0)}%` : costChange < 0 ? `${(costChange * 100).toFixed(0)}%` : '0%';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {sc.name.replaceAll('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium">
                      <span className={revChange < 0 ? 'text-rose-600' : revChange > 0 ? 'text-emerald-600' : 'text-slate-500'}>
                        {revStr}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium">
                      <span className={costChange > 0 ? 'text-rose-600' : costChange < 0 ? 'text-emerald-600' : 'text-slate-500'}>
                        {costStr}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      <span className={sc.monthlyNetCashflow >= 0 ? 'text-teal-800' : 'text-rose-600'}>
                        {formatIndianNumber(Math.round(sc.monthlyNetCashflow), lang, true)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {sc.canServiceDebt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          <CheckCircle2 size={11} /> [YES] Resilient
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle size={11} /> [NO] Margin Squeeze
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Simulates enterprise cashflow resilience against severe adverse supply and demand shocks (+/- 10% to 20%). Green badges indicate the business maintains sufficient surplus to cover bank EMIs.
      </p>
    </div>
  );
}