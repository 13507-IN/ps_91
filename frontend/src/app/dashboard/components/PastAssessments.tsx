'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Calendar, MapPin } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LAST_REPORT_KEY } from '@/lib/constants';
import { listCachedReports } from '@/lib/offline/offlineStore';
import type { FeasibilityReport } from '@/types';
import Link from 'next/link';

interface FeasibilityAnalysisSummary {
  id: string;
  businessCategory: string;
  businessIdea: string | null;
  villageName: string | null;
  district: string | null;
  state: string | null;
  overallScore: number | null;
  createdAt: string;
}

export function PastAssessments() {
  const { t } = useTranslation();
  const [localAnalyses, setLocalAnalyses] = useState<FeasibilityAnalysisSummary[]>([]);

  // Load offline or session-stored report fallback
  useEffect(() => {
    async function loadOffline() {
      const items: FeasibilityAnalysisSummary[] = [];

      // Check session storage last report
      try {
        const sessionRaw = window.sessionStorage.getItem(LAST_REPORT_KEY);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw) as FeasibilityReport;
          if (parsed && parsed.id) {
            const vName =
              parsed.villageName ||
              parsed.opportunityAnalysis?.villageName ||
              (parsed as unknown as { location?: { villageName?: string } })?.location?.villageName ||
              null;
            const dName =
              parsed.district ||
              parsed.opportunityAnalysis?.districtName ||
              (parsed as unknown as { location?: { district?: string } })?.location?.district ||
              null;
            const sName =
              parsed.state ||
              parsed.opportunityAnalysis?.stateName ||
              (parsed as unknown as { location?: { state?: string } })?.location?.state ||
              'West Bengal';

            items.push({
              id: parsed.id,
              businessCategory: parsed.businessCategory,
              businessIdea: parsed.businessIdea,
              villageName: vName,
              district: dName,
              state: sName,
              overallScore: parsed.feasibilityScore?.totalScore ?? null,
              createdAt: parsed.createdAt || new Date().toISOString(),
            });
          }
        }
      } catch {
        // ignore
      }

      // Check IndexedDB offline reports
      try {
        const cached = await listCachedReports();
        for (const c of cached) {
          if (!items.some((i) => i.id === c.id)) {
            const cAny = c as unknown as { villageName?: string; district?: string; state?: string; location?: { villageName?: string; district?: string; state?: string } };
            const vName = cAny.villageName || cAny.location?.villageName || null;
            const dName = cAny.district || cAny.location?.district || null;
            const sName = cAny.state || cAny.location?.state || 'West Bengal';

            items.push({
              id: c.id,
              businessCategory: c.category,
              businessIdea: c.idea,
              villageName: vName,
              district: dName,
              state: sName,
              overallScore: null,
              createdAt: c.savedAt || new Date().toISOString(),
            });
          }
        }
      } catch {
        // ignore
      }

      setLocalAnalyses(items);
    }

    loadOffline();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['feasibility-analyses'],
    queryFn: () => api<{ total: number; analyses: FeasibilityAnalysisSummary[] }>(apiEndpoints.feasibility.analyses),
    retry: 1,
  });

  const apiAnalyses = data?.analyses ?? [];
  
  // Merge API analyses with localAnalyses (deduplicating by id)
  const mergedMap = new Map<string, FeasibilityAnalysisSummary>();
  for (const item of localAnalyses) {
    mergedMap.set(item.id, item);
  }
  for (const item of apiAnalyses) {
    mergedMap.set(item.id, item);
  }

  const analyses = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (isLoading && localAnalyses.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6 mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
          <FileText className="h-5 w-5 text-[#E65C00]" /> {t.dashboard.pastAssessments}
        </h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#E65C00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B]">
          <FileText className="h-5 w-5 text-[#E65C00]" /> {t.dashboard.pastAssessments}
        </h2>
        {analyses.length > 0 && (
          <span className="text-xs font-semibold text-[#1A3A6B] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {analyses.length} Total
          </span>
        )}
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">{t.dashboard.noAssessments}</p>
          <p className="text-xs text-gray-500 mb-4">{t.dashboard.pastAssDesc}</p>
          <Link href="/assessment-wizard" className="inline-block px-4 py-2 bg-[#1A3A6B] text-white rounded text-xs font-semibold hover:bg-[#152e55] transition-colors">
            {t.nav.assess}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/feasibility-report?id=${analysis.id}`}
              className="block p-4 rounded-xl border border-gray-200 hover:border-[#1A3A6B] hover:shadow-md transition-all group bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm text-[#1A3A6B] group-hover:text-[#E65C00] transition-colors">
                  {t.business?.categories?.[analysis.businessCategory as keyof typeof t.business.categories] || analysis.businessCategory}
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  analysis.overallScore !== null && analysis.overallScore >= 70 ? 'bg-green-100 text-green-800' :
                  analysis.overallScore !== null && analysis.overallScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  analysis.overallScore !== null ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {t.dashboard.viabilityScore}: {analysis.overallScore !== null ? analysis.overallScore : '--'}/100
                </div>
              </div>
              
              {analysis.businessIdea && (
                <p className="text-xs text-gray-600 line-clamp-1 mb-3">
                  {analysis.businessIdea}
                </p>
              )}

              <div className="space-y-1.5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {[analysis.villageName, analysis.district].filter(Boolean).join(', ') || 'Local Village'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {new Date(analysis.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
