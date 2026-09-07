'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, apiEndpoints } from '@/lib/api/client';
import { LAST_REPORT_KEY } from '@/lib/constants';
import { mockReport } from './mockReportData';
import type { FeasibilityReport } from '@/types';
import { ReportHeader } from './ReportHeader';
import { VerdictHeroSection } from './VerdictHeroSection';
import { MarketIntelligenceSection } from './MarketIntelligenceSection';
import { CompetitionSection } from './CompetitionSection';
import { FinancialPlanSection } from './FinancialPlanSection';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import { AIRecommendationSection } from './AIRecommendationSection';
import { ActionPlanSection } from './ActionPlanSection';
import { ScoreBreakdownChart } from './ScoreBreakdownChart';

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
    queryFn: () => api<FeasibilityReport>(`${apiEndpoints.feasibility.analyses}/${reportId}`),
    enabled: Boolean(reportId) && !localReport,
  });

  // Only fall back to mockReport when there is no real reportId to fetch.
  // When reportId is present and the fetch fails, we want the error UI to show.
  const report: FeasibilityReport | null =
    localReport ?? fetched ?? (!reportId && mounted ? mockReport : null);

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
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Your report is ready! It is saved in this tab. Login to keep it permanently.
        </div>
      )}
      <ReportHeader category={report.businessCategory} showSavePrompt={Boolean(isNew)} />
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