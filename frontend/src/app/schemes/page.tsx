'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Landmark, ArrowRight, ExternalLink } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { inr, percent } from '@/lib/format';
import { getSchemePortalUrl } from '@/lib/api/feasibility';
import type { SchemeConfig } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SchemesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schemes-list'],
    queryFn: () => api<SchemeConfig[]>(apiEndpoints.schemes.list),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t.schemes.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t.schemes.subtitle}
      </p>

      {/* ── Udyam Registration Guide Banner ── */}
      <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A3A6B] to-[#2a4d8c] p-6 sm:p-8 shadow-md border border-[#1A3A6B]/20">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
                <span className="bg-[#E65C00] text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">Guide</span>
                {t.udyamGuide.title}
              </h2>
              <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
                {t.udyamGuide.subtitle}
              </p>
            </div>
            <a 
              href="https://udyamregistration.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E65C00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#cc5200] transition-colors shadow-sm shrink-0"
            >
              {t.udyamGuide.cta} <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: 1, title: t.udyamGuide.step1Title, desc: t.udyamGuide.step1Desc },
              { num: 2, title: t.udyamGuide.step2Title, desc: t.udyamGuide.step2Desc },
              { num: 3, title: t.udyamGuide.step3Title, desc: t.udyamGuide.step3Desc },
              { num: 4, title: t.udyamGuide.step4Title, desc: t.udyamGuide.step4Desc }
            ].map((step, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#E65C00]/20 text-[#FF9933] text-xs font-black">
                    {step.num}
                  </div>
                  <h3 className="text-white text-sm font-bold">{step.title}</h3>
                </div>
                <p className="text-blue-100/80 text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Background accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden="true" />
      </div>

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
            {t.schemes.loadError}
          </p>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">{t.schemes.noSchemes}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((scheme) => {
            const portalUrl = scheme.applyUrl || getSchemePortalUrl(scheme.name);
            return (
              <div
                key={scheme.schemeId}
                className="card group p-5 flex flex-col justify-between transition-all hover:shadow-md border border-slate-200 rounded-2xl bg-white"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <Landmark className="h-5 w-5 text-brand-600" />
                    </div>
                    <Link
                      href={`/schemes/${scheme.schemeId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      {t.schemes.details} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.name || scheme.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.description || scheme.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">{t.schemes.maxLoan}</div>
                      <div className="mt-0.5 font-bold text-slate-900">
                        {inr(scheme.financial.maxLoanAmount)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">{t.schemes.interest}</div>
                      <div className="mt-0.5 font-bold text-slate-900">
                        {percent(scheme.financial.interestRate)}
                      </div>
                    </div>
                    {scheme.financial.subsidyPercentage > 0 && (
                      <div className="rounded-lg bg-emerald-50 p-2.5">
                        <div className="text-emerald-600">{t.schemes.subsidy}</div>
                        <div className="mt-0.5 font-bold text-emerald-800">
                          {percent(scheme.financial.subsidyPercentage)}
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-slate-500">{t.schemes.tenure}</div>
                      <div className="mt-0.5 font-bold text-slate-900">
                        {scheme.financial.tenureMonths} {t.schemes.months}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.nodalAgency || scheme.nodalAgency}
                  </span>
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E65C00] text-xs font-bold text-white hover:bg-[#cc5200] transition-colors shrink-0 shadow-xs"
                  >
                    {t.schemes.applyOnline} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}