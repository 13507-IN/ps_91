'use client';

import { Sparkles, ThumbsUp, AlertTriangle, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { decisionColor } from '@/lib/format';
import type { AiRecommendation, FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { TextToSpeech } from '@/components/TextToSpeech';
import { getLocalizedAiSummary, getLocalizedNextStep } from '@/lib/i18n/reportTranslator';

export function AIRecommendationSection({
  recommendation,
  report,
}: {
  recommendation: AiRecommendation;
  report?: FeasibilityReport;
}) {
  const { t, lang } = useTranslation();

  const getDecisionText = (decision: string) => {
    if (decision === 'PROCEED') return t.report.proceed;
    if (decision === 'CAUTION') return t.report.caution;
    if (decision === 'NOT_VIABLE') return t.report.notViable;
    return decision.replaceAll('_', ' ');
  };

  const localizedSummary = report ? getLocalizedAiSummary(report, lang) : recommendation.summary;
  const localizedNextStep = report ? getLocalizedNextStep(report, lang) : recommendation.recommendedNextStep;

  let narrationText = '';
  if (lang === 'BN') {
    narrationText = [
      localizedSummary,
      recommendation.selectionReasoning ? `মডেল নির্বাচনের কারণ: ${recommendation.selectionReasoning}` : '',
      recommendation.strengths && recommendation.strengths.length > 0
        ? `প্রধান সুবিধাসমূহ: ${recommendation.strengths.join('. ')}`
        : '',
      localizedNextStep ? `পরবর্তী পদক্ষেপ: ${localizedNextStep}` : '',
    ].filter(Boolean).join('. ');
  } else if (lang === 'HI') {
    narrationText = [
      localizedSummary,
      recommendation.selectionReasoning ? `मॉडल चयन का कारण: ${recommendation.selectionReasoning}` : '',
      recommendation.strengths && recommendation.strengths.length > 0
        ? `मुख्य विशेषताएं: ${recommendation.strengths.join('. ')}`
        : '',
      localizedNextStep ? `अगला कदम: ${localizedNextStep}` : '',
    ].filter(Boolean).join('. ');
  } else {
    narrationText = [
      recommendation.summary,
      recommendation.selectionReasoning ? `Why Selected: ${recommendation.selectionReasoning}` : '',
      recommendation.strengths && recommendation.strengths.length > 0
        ? `Strengths: ${recommendation.strengths.join('. ')}`
        : '',
      recommendation.recommendedNextStep
        ? `Recommended Next Step: ${recommendation.recommendedNextStep}`
        : '',
    ].filter(Boolean).join('. ');
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t.aiRecommendation.title}</h2>
        </div>
        <TextToSpeech text={narrationText} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {lang === 'BN'
          ? 'প্রতিটি সুপারিশ ব্যাখ্যাযোগ্য। গাণিতিক আর্থিক এবং ভৌগোলিক নিয়ম যোগ্যতার মান নির্ধারণ করে; এআই ফলাফল বিশ্লেষণ করে।'
          : lang === 'HI'
          ? 'प्रत्येक सिफारिश समझाई जा सकती है। गणितीय वित्तीय और जनसांख्यिकीय नियम पात्रता तय करते हैं; एআই परिणामों की व्याख्या करता है।'
          : 'Every recommendation is explainable. Deterministic financial & demographic rules decide eligibility; AI explains the results.'}
      </p>

      {/* WHY THIS MODEL WAS SELECTED JUSTIFICATION CARD */}
      {recommendation.selectionReasoning && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/90 p-4 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900 mb-1">
            <CheckCircle2 size={15} className="text-teal-700" />
            {lang === 'BN' ? 'এই মডেলটি কেন নির্বাচন করা হয়েছে' : lang === 'HI' ? 'यह मॉडल क्यों चुना गया' : 'Why This Model Was Selected'}
          </div>
          <p className="text-xs sm:text-sm text-teal-950 font-medium leading-relaxed">
            {recommendation.selectionReasoning}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <ThumbsUp className="h-4 w-4 text-emerald-600" /> {t.aiRecommendation.strengths}
            </h3>
          </div>
          <ul className="mt-3 space-y-2">
            {(Array.isArray(recommendation.strengths) ? recommendation.strengths : []).map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> {t.aiRecommendation.weaknesses}
          </h3>
          <ul className="mt-3 space-y-2">
            {(Array.isArray(recommendation.weaknesses) ? recommendation.weaknesses : []).map((w) => (
              <li key={w} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {lang === 'BN' ? 'পরবর্তী সর্বোত্তম পদক্ষেপ' : lang === 'HI' ? 'अगला सर्वोत्तम कदम' : 'Next best step'}
          </div>
          <div className="mt-1 flex items-start gap-2 text-sm">
            <ArrowRightCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            <span>{localizedNextStep || recommendation.recommendedNextStep}</span>
          </div>
        </div>
        <span
          className={`shrink-0 self-start rounded-full px-4 py-2 text-sm font-bold ${decisionColor[recommendation.decision]}`}
        >
          {getDecisionText(recommendation.decision)}
        </span>
      </div>
    </section>
  );
}