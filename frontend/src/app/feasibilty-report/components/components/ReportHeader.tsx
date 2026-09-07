'use client';

import Link from 'next/link';
import { Plus, Printer, LogIn } from 'lucide-react';
import type { BusinessCategory } from '@/types';

export function ReportHeader({
  category,
  showSavePrompt,
}: {
  category: BusinessCategory;
  showSavePrompt: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feasibility Report</h1>
        <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          {category.replaceAll('_', ' ')}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {showSavePrompt && (
          <Link href="/login" className="btn-secondary">
            <LogIn className="h-4 w-4" /> Save this report
          </Link>
        )}
        <button onClick={() => window.print()} className="btn-secondary">
          <Printer className="h-4 w-4" /> Print / PDF
        </button>
        <Link href="/assessment-wizard" className="btn-primary">
          <Plus className="h-4 w-4" /> New Assessment
        </Link>
      </div>
    </div>
  );
}