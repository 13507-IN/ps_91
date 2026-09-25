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
import { Sparkles, ChevronDown, ArrowUp, CheckCircle2 } from 'lucide-react';
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
const EquipmentRequirementSection = dynamic(
  () => import('./EquipmentRequirementSection').then(m => ({ default: m.EquipmentRequirementSection })),
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
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'FULL'>('SUMMARY');
  const { t, lang } = useTranslation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'full') {
        setViewMode('FULL');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleViewFullReport = () => {
    setViewMode('FULL');
    setTimeout(() => {
      const detailedSection = document.getElementById('detailed-report-sections');
      if (detailedSection) {
        detailedSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

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

      {/* ─── Mode Switcher Bar ─── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('SUMMARY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'SUMMARY'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.report.viewModeSummary}</span>
            <span className="hidden md:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-700/80 text-white font-medium">
              {lang === 'HI' ? 'सरल' : lang === 'BN' ? 'সহজ' : 'Easy'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('FULL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'FULL'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.report.viewModeFull}</span>
            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${
              viewMode === 'FULL' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              12
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2">
          {viewMode === 'SUMMARY' ? (
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.report.summaryModeDesc}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              {lang === 'HI' ? 'संपूर्ण 12 मॉड्यूल और बैंक DPR सक्रिय हैं' : lang === 'BN' ? '১২টি মডিউল ও ব্যাংক DPR সক্রিয়' : 'All 12 Modules & Bankable DPR Active'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <VerdictHeroSection report={report} />
        <PlainLanguageSummaryCard
          report={report}
          onViewFullReport={viewMode === 'SUMMARY' ? handleViewFullReport : undefined}
        />

        {viewMode === 'SUMMARY' && (
          <div className="rounded-3xl border-2 border-[#1A3A6B]/40 bg-gradient-to-br from-[#102347] via-[#1A3A6B] to-[#0D1D3A] text-white p-6 sm:p-8 shadow-xl text-center flex flex-col items-center justify-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>{lang === 'HI' ? 'विस्तृत बैंक प्रस्तुति के लिए' : lang === 'BN' ? 'ব্যাংক উপস্থাপনার জন্য' : 'For Bank Approval & Technical Review'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black max-w-xl">
              {lang === 'HI'
                ? 'क्या आप पूरी वित्तीय योजना, मशीनरी लागत और गांव का नक्शा देखना चाहते हैं?'
                : lang === 'BN'
                ? 'আপনি কি সম্পূর্ণ আর্থিক পরিকল্পনা, মেশিনের খরচ ও গ্রামের মানচিত্র দেখতে চান?'
                : 'Need the complete financial plan, equipment quotes & local market map?'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-lg">
              {t.report.viewFullReportSub}
            </p>
            <button
              type="button"
              onClick={handleViewFullReport}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
            >
              <ChevronDown className="h-5 w-5" />
              <span>{t.report.viewFullReportCta}</span>
            </button>
          </div>
        )}

        {viewMode === 'FULL' && (
          <div id="detailed-report-sections" className="space-y-6 pt-2">
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
            <EquipmentRequirementSection
              equipmentList={report.equipmentList || report.financialPlan.equipmentList}
              businessCategory={report.businessCategory}
              projectCost={report.financialPlan.projectCost}
              promoterMargin={report.financialPlan.availableCapital}
              loanAmount={report.financialPlan.netLoanAmount || report.financialPlan.loanRequired}
              location={report.marketIntelligence?.catchmentRadiusKm ? `${report.marketIntelligence.catchmentRadiusKm}km Catchment Area` : undefined}
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

            {/* Bottom Collapse to Summary Button */}
            <div className="flex justify-center pt-4 pb-8">
              <button
                type="button"
                onClick={() => {
                  setViewMode('SUMMARY');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <ArrowUp className="h-4 w-4 text-teal-700" />
                <span>{t.report.backToSummary}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'FULL' && <DPRExportBar report={report} />}
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