'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { inrCompact } from '@/lib/format';
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
    return {
      name: units.toLocaleString('en-IN'),
      revenue,
      totalCost,
    };
  });

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
          <div className="text-xs text-slate-500">Break-even Month</div>
          <div className="text-lg font-bold text-slate-900">{breakeven.breakEvenMonth ? `Month ${breakeven.breakEvenMonth}` : 'N/A'}</div>
      </div>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} label="units" />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine
              x={breakeven.breakEvenUnits.toLocaleString('en-IN')}
              stroke="#f59e0b"
              strokeDasharray="4 4"
            />
            <Line type="monotone" dataKey="revenue" stroke="#1e9275" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="totalCost" stroke="#f43f5e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}