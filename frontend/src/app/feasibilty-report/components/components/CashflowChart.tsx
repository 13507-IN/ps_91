'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
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
    emi: row.emi,
    netCashflow: row.netCashflow,
  }));

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
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#1e9275" radius={[4, 4, 0, 0]} />
            <Bar dataKey="operatingCosts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="netCashflow" stroke="#0f172a" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}