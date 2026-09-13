'use client';

import Link from 'next/link';
import { Plus, Printer, LogIn } from 'lucide-react';
import type { BusinessCategory } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function ReportHeader({
  category,
  showSavePrompt,
}: {
  category: BusinessCategory;
  showSavePrompt: boolean;
}) {
  const { t } = useTranslation();
  
  // Safe extraction for category text
  const categoryText = (t.business.categories as Record<string, string>)[category] || category.replaceAll('_', ' ');

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.report.title}</h1>
        <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          {categoryText}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {showSavePrompt && (
          <Link href="/login" className="btn-secondary">
            <LogIn className="h-4 w-4" /> {t.report.saveReport}
          </Link>
        )}
        <button onClick={() => window.print()} className="btn-secondary">
          <Printer className="h-4 w-4" /> {t.common.printPdf}
        </button>
        <Link href="/assessment-wizard" className="btn-primary">
          <Plus className="h-4 w-4" /> {t.common.newAssessment}
        </Link>
      </div>
    </div>
  );
}