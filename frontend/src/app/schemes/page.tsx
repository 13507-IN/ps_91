'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Landmark, ArrowRight } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { inr, percent } from '@/lib/format';
import type { SchemeConfig } from '@/types';

export default function SchemesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schemes-list'],
    queryFn: () => api<SchemeConfig[]>(apiEndpoints.schemes.list),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Browse all active government credit and subsidy schemes available for rural entrepreneurs.
      </p>

      {isLoading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse p-5">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800">
            Unable to load schemes. Please ensure the backend is running.
          </p>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">No schemes available yet.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((scheme) => (
            <Link
              key={scheme.schemeId}
              href={`/schemes/${scheme.schemeId}`}
              className="card group p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <Landmark className="h-5 w-5 text-brand-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-600" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{scheme.name}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{scheme.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-slate-500">Max Loan</div>
                  <div className="mt-0.5 font-bold text-slate-900">
                    {inr(scheme.financial.maxLoanAmount)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-slate-500">Interest</div>
                  <div className="mt-0.5 font-bold text-slate-900">
                    {percent(scheme.financial.interestRate)}
                  </div>
                </div>
                {scheme.financial.subsidyPercentage > 0 && (
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <div className="text-emerald-600">Subsidy</div>
                    <div className="mt-0.5 font-bold text-emerald-800">
                      {percent(scheme.financial.subsidyPercentage)}
                    </div>
                  </div>
                )}
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-slate-500">Tenure</div>
                  <div className="mt-0.5 font-bold text-slate-900">
                    {scheme.financial.tenureMonths} months
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                {scheme.nodalAgency}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}