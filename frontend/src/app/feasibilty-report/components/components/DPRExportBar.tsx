'use client';

import React, { useState } from 'react';
import { Download, Printer, Share2, Loader2, MessageCircle } from 'lucide-react';
import { downloadDPR, shareViaWhatsApp, type DPRApplicant } from '@/lib/pdf/generateDPR';
import { useAuthStore } from '@/lib/store/auth';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface DPRExportBarProps {
  report: FeasibilityReport;
}

export function DPRExportBar({ report }: DPRExportBarProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { t, lang } = useTranslation();

  const applicant: DPRApplicant = {
    name: user?.name ?? undefined,
    phone: user?.phone ?? undefined,
    email: user?.email ?? undefined,
    gender: user?.gender ?? undefined,
    category: user?.category ?? undefined,
    dateOfBirth: user?.dateOfBirth ?? undefined,
    village: user?.location?.village ?? undefined,
    block: user?.location?.block ?? undefined,
    district: user?.location?.district ?? undefined,
    state: user?.location?.state ?? undefined,
  };

  async function handleDownload() {
    setIsGenerating(true);
    try {
      await downloadDPR(report, applicant);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePrint() {
    window.print();
  }

  async function handleWhatsApp() {
    setIsSharing(true);
    try {
      await shareViaWhatsApp(report, applicant);
    } catch (err) {
      console.error('WhatsApp share failed:', err);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="sticky bottom-0 z-40 print:hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-t-2xl border border-b-0 border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left label */}
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#1A3A6B]">{t.feasibilityReportDetails.exportTitle}</p>
              <p className="text-[10px] text-slate-400">
                {lang === 'HI' ? 'बैंक स्वीकार्य आधिकारिक रिपोर्ट (DPR)' : lang === 'BN' ? 'ব্যাংক গ্রহণযোগ্য অফিশিয়াল रिपोर्ट (DPR)' : 'Bankable DPR Document'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Download PDF */}
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A3A6B] text-white text-sm font-semibold hover:bg-[#152e55] active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-wait shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden xs:inline">
                  {isGenerating ? t.common.loading : t.feasibilityReportDetails.downloadPdf}
                </span>
                <span className="xs:hidden">PDF</span>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-[0.97] transition-all"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">{t.feasibilityReportDetails.printDpr}</span>
              </button>

              {/* WhatsApp Share */}
              <button
                onClick={handleWhatsApp}
                disabled={isSharing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20BD5A] active:scale-[0.97] transition-all disabled:opacity-60 shadow-sm"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                <span className="hidden xs:inline">{t.feasibilityReportDetails.shareWhatsapp}</span>
              </button>

              {/* Native Share (mobile) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: 'ArthSetu Feasibility Report',
                      text: `${report.businessCategory} Business Report - Score: ${report.feasibilityScore.totalScore}/100`,
                      url: window.location.href,
                    }).catch(() => {});
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-[0.97] transition-all sm:hidden"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
