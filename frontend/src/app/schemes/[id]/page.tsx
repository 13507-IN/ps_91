'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Landmark,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  Banknote,
  Percent,
  ExternalLink,
} from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { inr, percent } from '@/lib/format';
import { getSchemePortalUrl } from '@/lib/api/feasibility';
import type { SchemeConfig } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SchemeDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const schemeId = params?.id;

  const { data: scheme, isLoading, isError } = useQuery({
    queryKey: ['scheme', schemeId],
    queryFn: () =>
      api<SchemeConfig>(`${apiEndpoints.schemes.list}/${schemeId}`),
    enabled: Boolean(schemeId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">{t.schemes.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t.schemes.notFoundDesc}
        </p>
        <Link href="/schemes" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> {t.schemes.backToSchemes}
        </Link>
      </div>
    );
  }

  const el = scheme.eligibility;
  const fin = scheme.financial;
  const portalUrl = scheme.applyUrl || getSchemePortalUrl(scheme.name);

  const eligibilityItems = [
    el.categories && el.categories.length > 0 && `${t.schemes.socialCategories}: ${el.categories.join(', ')}`,
    el.gender && el.gender.length > 0 && `${t.schemes.gender}: ${el.gender.join(', ')}`,
    el.ageMin && `${t.schemes.minAge}: ${el.ageMin}`,
    el.ageMax && `${t.schemes.maxAge}: ${el.ageMax}`,
    el.isMinority !== undefined && el.isMinority !== null && (el.isMinority ? t.schemes.minorityOnly : t.schemes.nonMinorityEligible),
    el.businessCategories && el.businessCategories.length > 0 && `${t.schemes.businessTypes}: ${el.businessCategories.join(', ')}`,
    el.minProjectCost && `${t.schemes.minProjectCost}: ${inr(el.minProjectCost)}`,
    el.maxProjectCost && `${t.schemes.maxProjectCost}: ${inr(el.maxProjectCost)}`,
    el.states && el.states.length > 0 && `${t.schemes.states}: ${el.states.join(', ')}`,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/schemes" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-3.5 w-3.5" /> {t.schemes.allSchemes}
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
              <Landmark className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.name || scheme.name}
              </h1>
              {scheme.shortName && (
                <p className="text-sm text-slate-500">
                  {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.shortName || scheme.shortName}
                </p>
              )}
              <p className="mt-1 text-sm text-slate-600">
                {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.description || scheme.description}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {t.schemes.nodalAgency}: {t.schemeData?.[scheme.schemeId as keyof typeof t.schemeData]?.nodalAgency || scheme.nodalAgency}
              </p>
            </div>
          </div>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#E65C00] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cc5200] shadow-sm"
          >
            {t.schemes.applyOnline} <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Banknote className="h-3.5 w-3.5" /> {t.schemes.maxLoan}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900">{inr(fin.maxLoanAmount)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Percent className="h-3.5 w-3.5" /> {t.schemes.interestRate}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900">{percent(fin.interestRate)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {t.schemes.tenure}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900">{fin.tenureMonths} {t.schemes.months}</div>
          </div>
          {fin.subsidyPercentage > 0 && (
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="text-xs text-emerald-600">{t.schemes.subsidy}</div>
              <div className="mt-1 text-xl font-bold text-emerald-800">
                {percent(fin.subsidyPercentage)}
              </div>
              {fin.maxSubsidy > 0 && (
                <div className="text-[11px] text-emerald-600">{t.schemes.cap}: {inr(fin.maxSubsidy)}</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t.schemes.eligibility}</h2>
            {eligibilityItems.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">{t.schemes.noSpecificEligibility}</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {eligibilityItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t.schemes.loanDetails}</h2>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t.schemes.marginRequired}</dt>
                <dd className="font-medium text-slate-900">{percent(fin.marginPercentage)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{t.schemes.moratorium}</dt>
                <dd className="font-medium text-slate-900">
                  {fin.moratoriumMonths} {t.schemes.months} ({fin.moratoriumType?.replace('_', ' ')})
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-brand-600" /> {t.schemes.requiredDocuments}
            </h2>
            <ul className="mt-2 space-y-1">
              {scheme.requiredDocuments.map((doc) => (
                <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}