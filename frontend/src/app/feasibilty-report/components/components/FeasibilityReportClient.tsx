'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, apiEndpoints, hasSession } from '@/lib/api/client';
import { toFeasibilityReport, type BackendFeasibilityResult } from '@/lib/api/feasibility';
import { LAST_REPORT_KEY } from '@/lib/constants';
import { mockReport } from './mockReportData';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { ReportHeader } from './ReportHeader';
import { VerdictHeroSection } from './VerdictHeroSection';
import { MarketIntelligenceSection } from './MarketIntelligenceSection';
import { CompetitionSection } from './CompetitionSection';
import { FinancialPlanSection } from './FinancialPlanSection';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import { AIRecommendationSection } from './AIRecommendationSection';
import { ActionPlanSection } from './ActionPlanSection';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';
import { LocalSuppliersSection } from '../LocalSuppliersSection';

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
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LAST_REPORT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FeasibilityReport;
        if (parsed.businessCategory) setLocalReport(parsed);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const { data: fetched, isError } = useQuery({
    queryKey: ['feasibility', reportId],
    queryFn: async () => {
      const raw = await api<BackendFeasibilityResult>(`${apiEndpoints.feasibility.analyses}/${reportId}`);
      // If the backend returned a report formatted as FeasibilityReport or BackendFeasibilityResult
      if ((raw as unknown as FeasibilityReport).marketIntelligence?.catchmentRadiusKm !== undefined) {
        return raw as unknown as FeasibilityReport;
      }
      return toFeasibilityReport(raw);
    },
    enabled: Boolean(reportId),
  });

  // When reportId is provided, prioritize fetched report from backend.
  // When no reportId is provided, fall back to localReport (sessionStorage) or mockReport.
  const report: FeasibilityReport | null =
    reportId ? (fetched ?? null) : (localReport ?? (mounted ? mockReport : null));

  if (!mounted && !reportId) {
    return <LoadingSkeleton />;
  }

  if (!mounted && reportId) {
    return <LoadingSkeleton />;
  }

  if (!report && reportId && isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Report not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This report is linked to a logged-in user account, or it has been cleaned up. Start a new
          assessment to generate a fresh report.
        </p>
        <a href="/assessment-wizard" className="btn-primary mt-6">
          Start New Assessment
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-20">
              <h2 className="text-lg font-semibold text-slate-900">Viability Score Breakdown</h2>
              <p className="mt-1 text-xs text-slate-500">Five dimensions, each scored /20.</p>
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

        <FinancialPlanSection
          plan={report.financialPlan}
          schemeNames={report.schemeMatches.map((s) => s.name)}
        />
        <RiskAssessmentSection risk={report.riskAssessment} />

        <div className="grid gap-6 lg:grid-cols-1">
          <AIRecommendationSection recommendation={report.aiRecommendation} />
        </div>

        <ActionPlanSection plan={report.actionPlan} />
      </div>
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