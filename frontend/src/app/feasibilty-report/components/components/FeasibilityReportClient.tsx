'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { api, apiEndpoints, hasSession } from '@/lib/api/client';
import { toFeasibilityReport, type BackendFeasibilityResult } from '@/lib/api/feasibility';
import { LAST_REPORT_KEY } from '@/lib/constants';
import { mockReport } from './mockReportData';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
// Above-the-fold: keep as static imports (immediately visible)
import { ReportHeader } from './ReportHeader';
import { VerdictHeroSection } from './VerdictHeroSection';
import { PlainLanguageSummaryCard } from './PlainLanguageSummaryCard';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';
import { saveReportOffline, getReportOffline } from '@/lib/offline/offlineStore';

// Below-the-fold: lazy-load heavy components (chart.js, leaflet, jspdf, html2canvas)
const SectionSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-slate-100 h-48" />
);

const MarketIntelligenceSection = dynamic(
  () => import('./MarketIntelligenceSection').then(m => ({ default: m.MarketIntelligenceSection })),
  { loading: () => <SectionSkeleton /> }
);
const CompetitionSection = dynamic(
  () => import('./CompetitionSection').then(m => ({ default: m.CompetitionSection })),
  { loading: () => <SectionSkeleton /> }
);
const FinancialPlanSection = dynamic(
  () => import('./FinancialPlanSection').then(m => ({ default: m.FinancialPlanSection })),
  { loading: () => <SectionSkeleton /> }
);
const RiskAssessmentSection = dynamic(
  () => import('./RiskAssessmentSection').then(m => ({ default: m.RiskAssessmentSection })),
  { loading: () => <SectionSkeleton /> }
);
const AIRecommendationSection = dynamic(
  () => import('./AIRecommendationSection').then(m => ({ default: m.AIRecommendationSection })),
  { loading: () => <SectionSkeleton /> }
);
const ActionPlanSection = dynamic(
  () => import('./ActionPlanSection').then(m => ({ default: m.ActionPlanSection })),
  { loading: () => <SectionSkeleton /> }
);
const LocalSuppliersSection = dynamic(
  () => import('../LocalSuppliersSection').then(m => ({ default: m.LocalSuppliersSection })),
  { loading: () => <SectionSkeleton /> }
);
const DPRExportBar = dynamic(
  () => import('./DPRExportBar').then(m => ({ default: m.DPRExportBar })),
  { ssr: false }
);
const DocumentChecklist = dynamic(
  () => import('./DocumentChecklist').then(m => ({ default: m.DocumentChecklist })),
  { loading: () => <SectionSkeleton /> }
);
const HyperlocalBusinessExplorer = dynamic(
  () => import('@/components/HyperlocalBusinessExplorer/HyperlocalBusinessExplorer').then(m => ({ default: m.HyperlocalBusinessExplorer })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);


export function FeasibilityReportClient({
  reportId,
  isNew,
}: {
  reportId?: string;
  isNew?: boolean;
}) {
  // Hydration-safe: only touch sessionStorage after mount.
  const [mounted, setMounted] = useState(false);
  const [localReport, setLocalReport] = useState<FeasibilityReport | null>(null);
  const [offlineLoadedReport, setOfflineLoadedReport] = useState<FeasibilityReport | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_REPORT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FeasibilityReport;
        if (parsed.businessCategory) {
          setLocalReport(parsed);
          saveReportOffline(parsed).catch(() => {});
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const { data: fetched, isError } = useQuery({
    queryKey: ['feasibility', reportId],
    queryFn: async () => {
      try {
        const raw = await api<BackendFeasibilityResult>(`${apiEndpoints.feasibility.analyses}/${reportId}`);
        const result = (raw as unknown as FeasibilityReport).marketIntelligence?.catchmentRadiusKm !== undefined
          ? (raw as unknown as FeasibilityReport)
          : toFeasibilityReport(raw);
        saveReportOffline(result).catch(() => {});
        return result;
      } catch (err) {
        // Try offline fallback
        if (reportId) {
          const offlineReport = await getReportOffline(reportId);
          if (offlineReport) {
            setOfflineLoadedReport(offlineReport);
            return offlineReport;
          }
        }
        throw err;
      }
    },
    enabled: Boolean(reportId),
  });

  // When reportId is provided, prioritize fetched report from backend.
  // When no reportId is provided, fall back to localReport (sessionStorage) or mockReport.
  const report: FeasibilityReport | null =
    reportId ? (fetched ?? offlineLoadedReport ?? null) : (localReport ?? (mounted ? mockReport : null));

  if (!mounted && !reportId) {
    return <LoadingSkeleton />;
  }

  if (!mounted && reportId) {
    return <LoadingSkeleton />;
  }

  if (!report && reportId && isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">{t.report.notFound}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t.report.notFoundDesc}
        </p>
        <a href="/assessment-wizard" className="btn-primary mt-6">
          {t.common.startNew}
        </a>
      </div>
    );
  }

  if (!report) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {isNew && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${hasSession() ? 'border-green-200 bg-green-50 text-green-800' : 'border-brand-200 bg-brand-50 text-brand-800'}`}>
          {hasSession() ? t.report.reportReady : t.report.reportReadyGuest}
        </div>
      )}
      <ReportHeader category={report.businessCategory} showSavePrompt={Boolean(isNew) && !hasSession()} />
      <div className="space-y-6">
        <VerdictHeroSection report={report} />
        <PlainLanguageSummaryCard report={report} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-20">
              <h2 className="text-lg font-semibold text-slate-900">{t.scores.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{t.scores.subtitle}</p>
              <div className="mt-4">
                <ScoreBreakdownChart score={report.feasibilityScore} />
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <MarketIntelligenceSection market={report.marketIntelligence} />
            <CompetitionSection
              competitors={report.competitorAnalysis}
              opportunity={report.opportunityAnalysis}
            />
            <LocalSuppliersSection suppliers={report.localSuppliers || []} category={report.businessCategory} />
          </div>
        </div>

        <HyperlocalBusinessExplorer
          latitude={report.catchment?.latitude ?? 23.4015}
          longitude={report.catchment?.longitude ?? 88.5012}
          locationName={`${report.businessCategory.replace('_', ' ')} Catchment Area`}
          initialRadiusKm={report.catchment?.radiusKm ?? 10}
          initialCategory={report.businessCategory}
          title={t.report.hyperlocalTitle}
        />

        <FinancialPlanSection
          plan={report.financialPlan}
          schemeNames={report.schemeMatches.map((s) => s.name)}
        />
        <RiskAssessmentSection risk={report.riskAssessment} />

        <div className="grid gap-6 lg:grid-cols-1">
          <AIRecommendationSection recommendation={report.aiRecommendation} />
        </div>

        <ActionPlanSection plan={report.actionPlan} />

        <DocumentChecklist
          schemeName={report.financialPlan.matchedSchemeName}
          businessCategory={report.businessCategory}
        />
      </div>

      <DPRExportBar report={report} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}