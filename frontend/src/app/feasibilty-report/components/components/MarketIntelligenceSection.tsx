'use client';

import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { SourceTag } from '@/components/SourceTag';
import { number } from '@/lib/format';
import type { MarketIntelligence } from '@/types';

export function MarketIntelligenceSection({ market }: { market: MarketIntelligence }) {
  const pop = market.totalPopulation || 0;
  const hh = market.totalHouseholds || 0;
  
  const stats = [
    { label: 'Total Population', value: pop > 0 ? number(pop) : '~5,000', kind: pop > 0 ? 'Observed' : 'Estimated' },
    { label: 'Total Households', value: hh > 0 ? number(hh) : '~1,200', kind: hh > 0 ? 'Observed' : 'Estimated' },
    { label: 'Literacy Rate', value: market.literacyRate ? `${market.literacyRate}%` : '—', kind: 'Observed' },
  ];

  const amenities = market.amenitiesCount ?? {};
  const infra = market.infrastructure ?? {};
  const topCrops = Array.isArray(market.topCrops) ? market.topCrops : [];
  const livestock = market.livestock ?? {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Market Intelligence</h2>
        <ConfidenceBadge level={market.confidence} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Demographics and infrastructure within the catchment area.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-brand-700">{s.value}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div>
            <div className="mt-2">
              <SourceTag kind={s.kind as "Observed" | "Estimated" | "Reported" | "Inferred"} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Top Crops</h3>
          <ul className="mt-2 space-y-1.5">
            {topCrops.length === 0 && (
              <li className="text-xs text-slate-500">No crop data available.</li>
            )}
            {topCrops.map((c) => {
              const cropObj = typeof c === 'object' && c !== null ? (c as unknown as Record<string, unknown>) : null;
              const cropName = cropObj ? String(cropObj.cropName ?? c) : String(c);
              const area = cropObj?.areaHectares ? number(Number(cropObj.areaHectares)) : null;
              return (
                <li
                  key={cropName}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{cropName}</span>
                  <span className="text-xs text-slate-500">
                    {area ? `${area} ha` : '—'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Livestock</h3>
          <ul className="mt-2 space-y-1.5">
            {Object.keys(livestock).length === 0 && (
              <li className="text-xs text-slate-500">No livestock data available.</li>
            )}
            {Object.entries(livestock).map(([species, totalCount]) => (
              <li
                key={species}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="capitalize text-slate-700">{species}</span>
                <span className="text-xs font-semibold text-slate-600">
                  {number(Number(totalCount) || 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Amenities & Institutions</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {Object.entries(amenities).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize text-slate-500">{k.replaceAll(/([A-Z])/g, ' $1')}</span>
                <span>{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Infrastructure & Connectivity</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {Object.entries(infra).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize text-slate-500">{k.replaceAll(/([A-Z])/g, ' $1')}</span>
                <span>{String(v)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <SourceTag kind="Observed" />
          </div>
        </div>
      </div>
    </section>
  );
}