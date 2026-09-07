'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { riskColor } from '@/lib/format';
import type { StressTestOutput } from '@/types';

export function StressTestChart({ stressTest }: { stressTest: StressTestOutput }) {
  const scenarios = Array.isArray(stressTest.scenarios) ? stressTest.scenarios : [];

  const data = scenarios.map((s) => ({
    name: String(s.name ?? 'Scenario').replaceAll('_', ' '),
    postEmiCashflow: Number(s.monthlyNetCashflow ?? 0),
  }));

  const rawTest = stressTest as unknown as Record<string, unknown>;
  const overallRisk = (typeof rawTest.overallRiskLevel === 'string' ? rawTest.overallRiskLevel : null) ?? (stressTest.base?.canServiceDebt ? 'LOW' : 'MEDIUM');

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
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} height={50} textAnchor="end" />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="postEmiCashflow" radius={[4, 4, 0, 0]}>
              {data.map((row, i) => (
                <Cell key={i} fill={row.postEmiCashflow >= 0 ? '#1e9275' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Red bars mean the business cannot cover its EMI under that scenario.
      </p>
    </div>
  );
}