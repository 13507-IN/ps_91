'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, Calendar, MapPin, Briefcase } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Link from 'next/link';

// Using partial types based on what the backend likely returns for the list
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
  
  const { data: analyses, isLoading, isError } = useQuery({
    queryKey: ['feasibility-analyses'],
    queryFn: () => api<FeasibilityAnalysisSummary[]>(apiEndpoints.feasibility.analyses),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
          <FileText className="h-5 w-5 text-[#E65C00]" /> {t.nav.sampleReport || 'Past Assessments'}
        </h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#E65C00]" />
        </div>
      </div>
    );
  }

  if (isError || !analyses) {
    return (
      <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B] mb-4">
          <FileText className="h-5 w-5 text-[#E65C00]" /> Past Assessments
        </h2>
        <div className="text-center py-8 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          Failed to load past assessments.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#DDDDDD] bg-white p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#1A3A6B]">
          <FileText className="h-5 w-5 text-[#E65C00]" /> Past Assessments
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
          <p className="text-sm font-medium text-gray-900 mb-1">No assessments yet</p>
          <p className="text-xs text-gray-500 mb-4">Run your first feasibility assessment to see it here.</p>
          <Link href="/assessment-wizard" className="inline-block px-4 py-2 bg-[#1A3A6B] text-white rounded text-xs font-semibold hover:bg-[#152e55] transition-colors">
            Start Assessment
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/feasibility-report/${analysis.id}`}
              className="block p-4 rounded-xl border border-gray-200 hover:border-[#1A3A6B] hover:shadow-md transition-all group bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm text-[#1A3A6B] group-hover:text-[#E65C00] transition-colors">
                  {t.business?.categories?.[analysis.businessCategory] || analysis.businessCategory}
                </div>
                {analysis.overallScore !== null && (
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    analysis.overallScore >= 70 ? 'bg-green-100 text-green-800' :
                    analysis.overallScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {analysis.overallScore}/100
                  </div>
                )}
              </div>
              
              {analysis.businessIdea && (
                <p className="text-xs text-gray-600 line-clamp-1 mb-3">
                  {analysis.businessIdea}
                </p>
              )}

              <div className="space-y-1.5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">
                    {analysis.villageName || 'Unknown Village'}
                    {analysis.district && `, ${analysis.district}`}
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
