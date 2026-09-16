'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Banknote,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Sparkles,
  FileText,
  Shield,
} from 'lucide-react';
import type { FeasibilityReport } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatIndianNumber } from '@/lib/i18n/formatNumber';
import { TextToSpeech } from '@/components/TextToSpeech';

/**
 * PlainLanguageSummaryCard
 *
 * A non-technical, easy-to-understand summary of the entire feasibility report.
 * Designed so that even an uneducated rural entrepreneur can grasp:
 *   - Is this business idea good or bad?
 *   - How much money is needed and where to get it?
 *   - How much profit can I expect?
 *   - What exact scheme should I apply for?
 *   - What are the first steps?
 *
 * All numbers are pulled from the REAL report data, not hardcoded.
 */
export function PlainLanguageSummaryCard({ report }: { report: FeasibilityReport }) {
  const { t, lang } = useTranslation();
  const ps = t?.plainSummary;

  // ─── Extract real data from the report ───────────────────────
  const totalScore = report.feasibilityScore?.totalScore ?? 0;
  const grade = report.feasibilityScore?.grade ?? 'MODERATE';
  const decision = report.aiRecommendation?.decision ?? 'MODIFY';

  const isGood = totalScore >= 65 || decision === 'PROCEED' || grade === 'EXCELLENT' || grade === 'GOOD';
  const isCaution = !isGood && (totalScore >= 45 || decision === 'MODIFY' || grade === 'MODERATE');
  // else → high risk

  // Demographics
  const pop = report.marketIntelligence?.totalPopulation || 0;
  const households = report.marketIntelligence?.totalHouseholds || 0;

  // Competition
  const competitorsCount = report.competitorAnalysis?.overallEstimate
    ?? report.competitorAnalysis?.totalObserved
    ?? 0;

  // Financial — use correct field names from EmiOutput/CashflowOutput/FinancialPlan
  const fp = report.financialPlan;
  const projectCost = fp?.projectCost || 0;
  const ownCapital = fp?.availableCapital || 0;
  const loanRequired = fp?.loanRequired || fp?.netLoanAmount || 0;
  const subsidyAmount = fp?.subsidyAmount || 0;
  const netLoanAmount = fp?.netLoanAmount || 0;
  const interestRate = fp?.interestRate || 0;
  const tenureMonths = fp?.tenureMonths || 0;

  // EMI — the field is `emi` inside EmiOutput, NOT `monthlyEmi`
  const monthlyEmi = fp?.emi?.emi || 0;

  // Monthly profit — use averageMonthlyCashflow from CashflowOutput
  const monthlyProfit = fp?.cashflow?.averageMonthlyCashflow || 0;

  // Break-even
  const breakEvenMonth = fp?.breakEven?.breakEvenMonth;

  // Scheme — use the ACTUAL matched scheme from the report
  const schemeName = fp?.matchedSchemeName || '';
  const schemeUrl = fp?.matchedSchemeUrl || '';
  const topScheme = report.schemeMatches?.find(s => s.eligible);
  const displaySchemeName = schemeName || topScheme?.name || '';
  const displaySchemeUrl = schemeUrl || topScheme?.applyUrl || '';

  // Opportunity
  const marketGaps = report.opportunityAnalysis?.marketGaps || [];
  const recommendedModel = report.opportunityAnalysis?.recommendedModel || '';

  // AI recommendation
  const aiSummary = report.aiRecommendation?.summary || '';
  const nextStep = report.aiRecommendation?.recommendedNextStep || '';
  const strengths = report.aiRecommendation?.strengths || [];

  // Action plan — first milestone tasks
  const firstMilestone = report.actionPlan?.milestones?.[0];
  const fundingChecklist = report.actionPlan?.fundingReadinessChecklist || [];

  // Risk
  const riskRating = report.riskAssessment?.riskRating || 'MEDIUM';

  // ─── Competition descriptor ─────────────────────────────────
  const competitionLow = ps?.competitionLow ?? 'Very few competitors in area';
  const competitionMod = ps?.competitionMod ?? 'Moderate competition';
  const competitionHigh = ps?.competitionHigh ?? 'High competition present';
  const competitionText = competitorsCount <= 2
    ? competitionLow
    : competitorsCount <= 6 ? competitionMod : competitionHigh;

  // ─── Build a REAL narration from actual report data ─────────
  const buildNarration = (): string => {
    const bizName = report.businessIdea || report.businessCategory?.replace(/_/g, ' ') || 'your business';

    const verdictLine = isGood
      ? lang === 'HI' ? `बधाई हो! "${bizName}" के लिए हालात बहुत अच्छे हैं।`
        : lang === 'BN' ? `অভিনন্দন! "${bizName}" এর জন্য পরিস্থিতি চমৎকার।`
          : `Great news! "${bizName}" has a high chance of success in your area.`
      : isCaution
        ? lang === 'HI' ? `"${bizName}" शुरू किया जा सकता है, लेकिन सावधानी रखें।`
          : lang === 'BN' ? `"${bizName}" শুরু করা যায়, তবে সতর্কতা জরুরি।`
            : `"${bizName}" is feasible but needs careful planning.`
        : lang === 'HI' ? `"${bizName}" में जोखिम अधिक है। सोच-समझकर आगे बढ़ें।`
          : lang === 'BN' ? `"${bizName}" এ ঝুঁকি বেশি। সতর্কতার সাথে এগিয়ে যান।`
            : `"${bizName}" carries high risk. Proceed with extreme caution.`;

    const popLine = pop > 0
      ? lang === 'HI' ? `आपके इलाके में ${formatIndianNumber(pop, lang)} लोग रहते हैं।`
        : lang === 'BN' ? `আপনার এলাকায় ${formatIndianNumber(pop, lang)} জন বাস করেন।`
          : `Your area has ${formatIndianNumber(pop, lang)} people.`
      : '';

    const moneyLine = projectCost > 0
      ? lang === 'HI' ? `कुल लागत ₹${formatIndianNumber(projectCost, lang)} है। आपकी पूंजी ₹${formatIndianNumber(ownCapital, lang)}, बाकी ₹${formatIndianNumber(loanRequired, lang)} ${displaySchemeName} योजना से लोन।`
        : lang === 'BN' ? `মোট খরচ ₹${formatIndianNumber(projectCost, lang)}। আপনার পুঁজি ₹${formatIndianNumber(ownCapital, lang)}, বাকি ₹${formatIndianNumber(loanRequired, lang)} ${displaySchemeName} প্রকল্প থেকে ঋণ।`
          : `Total cost ₹${formatIndianNumber(projectCost, lang)}. Your capital ₹${formatIndianNumber(ownCapital, lang)}, rest ₹${formatIndianNumber(loanRequired, lang)} via ${displaySchemeName}.`
      : '';

    const profitLine = monthlyProfit !== 0
      ? lang === 'HI' ? `EMI चुकाने के बाद हर महीने लगभग ₹${formatIndianNumber(Math.abs(monthlyProfit), lang)} ${monthlyProfit > 0 ? 'बचत' : 'घाटा'}।`
        : lang === 'BN' ? `EMI দেওয়ার পর প্রতি মাসে প্রায় ₹${formatIndianNumber(Math.abs(monthlyProfit), lang)} ${monthlyProfit > 0 ? 'লাভ' : 'লোকসান'}।`
          : `After EMI, estimated monthly ${monthlyProfit > 0 ? 'profit' : 'loss'}: ₹${formatIndianNumber(Math.abs(monthlyProfit), lang)}.`
      : '';

    const nextStepLine = nextStep
      ? lang === 'HI' ? `अगला कदम: ${nextStep}`
        : lang === 'BN' ? `পরবর্তী পদক্ষেপ: ${nextStep}`
          : `Next step: ${nextStep}`
      : '';

    return [verdictLine, popLine, moneyLine, profitLine, nextStepLine].filter(Boolean).join(' ');
  };

  const narrationScript = buildNarration();

  // ─── Safe fallback UI strings ───────────────────────────────
  const badgeText = ps?.badge ?? 'In Simple Words';
  const titleText = ps?.title ?? 'Plain Summary of Your Business Report';
  const subtitleText = ps?.subtitle ?? 'Everything you need to know — no complex numbers or technical terms.';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-5 sm:p-7 shadow-sm">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />

      {/* ─── Header ─── */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-teal-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 uppercase tracking-wide">
              {badgeText}
            </div>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900">{titleText}</h2>
            <p className="text-xs sm:text-sm text-slate-600">{subtitleText}</p>
          </div>
        </div>
        <div className="self-start sm:self-center shrink-0">
          <TextToSpeech text={narrationScript} className="shadow-xs" />
        </div>
      </div>

      {/* ─── Verdict Banner ─── */}
      <div className={`mt-5 rounded-xl border p-4 sm:p-5 ${
        isGood ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
          : isCaution ? 'border-amber-200 bg-amber-50/90 text-amber-950'
            : 'border-rose-200 bg-rose-50/90 text-rose-950'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isGood ? 'bg-emerald-600 text-white'
              : isCaution ? 'bg-amber-500 text-white'
                : 'bg-rose-600 text-white'
          }`}>
            {isGood ? <CheckCircle2 className="h-5 w-5" /> : isCaution ? <AlertTriangle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              {isGood
                ? (ps?.statusGoodTitle ?? 'Green Light: High Chance of Success')
                : isCaution
                  ? (ps?.statusCautionTitle ?? 'Yellow Light: Workable with Care')
                  : (ps?.statusRiskTitle ?? 'Red Light: High Risk Area')}
              <span className="text-xs font-semibold opacity-70">{totalScore}/100</span>
            </h3>
            {/* Use the REAL AI summary from the report */}
            <p className="mt-1 text-sm leading-relaxed opacity-95">
              {aiSummary || (isGood
                ? (ps?.statusGoodDesc ?? '')
                : isCaution ? (ps?.statusCautionDesc ?? '') : (ps?.statusRiskDesc ?? ''))}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 4 Key Info Cards ─── */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Customers & Market */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
            <Users className="h-4 w-4 text-teal-600" />
            {ps?.cardCustomers ?? 'Customers & Demand'}
          </div>
          {pop > 0 && (
            <div className="mt-2 text-xl font-black text-slate-900 font-tabular">
              {formatIndianNumber(pop, lang)}
            </div>
          )}
          <div className="text-xs text-slate-500 font-medium">{ps?.localPopulation ?? 'people living nearby'}</div>
          {households > 0 && (
            <div className="text-xs text-slate-500 mt-0.5">
              {formatIndianNumber(households, lang)} {lang === 'HI' ? 'परिवार' : lang === 'BN' ? 'পরিবার' : 'households'}
            </div>
          )}
          <div className="mt-2 inline-block rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
            {competitorsCount} {lang === 'HI' ? 'प्रतिस्पर्धी' : lang === 'BN' ? 'প্রতিযোগী' : 'competitors'} · {competitionText}
          </div>
          {marketGaps.length > 0 && (
            <div className="mt-2 text-[11px] text-emerald-700 font-medium">
              ✓ {marketGaps[0]}
            </div>
          )}
        </div>

        {/* 2. Money & Scheme */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs uppercase tracking-wider">
            <Banknote className="h-4 w-4 text-sky-600" />
            {ps?.cardMoney ?? 'Investment & Govt Help'}
          </div>
          {projectCost > 0 && (
            <div className="mt-2 text-xl font-black text-slate-900 font-tabular">
              ₹{formatIndianNumber(projectCost, lang)}
            </div>
          )}
          <div className="mt-1 space-y-1 text-xs text-slate-600">
            {ownCapital > 0 && (
              <div>{ps?.costFromYou ?? 'From your pocket'}: <span className="font-bold text-slate-800">₹{formatIndianNumber(ownCapital, lang)}</span></div>
            )}
            {loanRequired > 0 && displaySchemeName && (
              <div className="bg-sky-50 rounded-md p-1.5 font-medium">
                {ps?.costFromGovt ?? 'Govt Loan Scheme'}: <span className="font-bold text-sky-900">₹{formatIndianNumber(netLoanAmount || loanRequired, lang)}</span>
                <span className="block text-[11px] font-bold text-sky-800 mt-0.5">
                  {lang === 'HI' ? 'योजना' : lang === 'BN' ? 'প্রকল্প' : 'Scheme'}: {displaySchemeName}
                </span>
                {subsidyAmount > 0 && (
                  <span className="block text-[11px] font-bold text-emerald-700">
                    + ₹{formatIndianNumber(subsidyAmount, lang)} {ps?.subsidyBenefit ?? 'subsidy'}
                  </span>
                )}
              </div>
            )}
            {interestRate > 0 && (
              <div className="text-[11px] text-slate-500">
                {interestRate}% {lang === 'HI' ? 'ब्याज' : lang === 'BN' ? 'সুদ' : 'interest'} · {tenureMonths} {lang === 'HI' ? 'महीने' : lang === 'BN' ? 'মাস' : 'months'}
              </div>
            )}
          </div>
        </div>

        {/* 3. Monthly Profit/Loss */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            {ps?.cardProfit ?? 'Estimated Monthly Profit'}
          </div>
          {monthlyProfit !== 0 && (
            <div className={`mt-2 text-xl font-black font-tabular ${monthlyProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {monthlyProfit > 0 ? '+' : ''}₹{formatIndianNumber(Math.round(monthlyProfit), lang)}
              <span className="text-xs font-normal text-slate-500"> / {lang === 'HI' ? 'माह' : lang === 'BN' ? 'মাসে' : 'mo'}</span>
            </div>
          )}
          <div className="text-xs text-emerald-700 font-semibold">{ps?.takeHomeProfit ?? 'Net profit in hand'}</div>
          {monthlyEmi > 0 && (
            <div className="mt-2 text-xs text-slate-500 bg-emerald-50/60 rounded-md p-1.5 font-medium">
              {ps?.monthlyEmiLabel ?? 'Monthly Bank EMI'}: <span className="font-bold text-slate-800">₹{formatIndianNumber(Math.round(monthlyEmi), lang)}</span>
            </div>
          )}
          {breakEvenMonth && breakEvenMonth > 0 && (
            <div className="mt-1 text-[11px] text-slate-500">
              {lang === 'HI' ? `पूंजी वापसी:` : lang === 'BN' ? `পুঁজি ফেরত:` : `Break-even:`} {breakEvenMonth} {lang === 'HI' ? 'महीने' : lang === 'BN' ? 'মাসে' : 'months'}
            </div>
          )}
        </div>

        {/* 4. Risk & Key Advice */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            {ps?.cardTip ?? 'Key Advice'}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Shield className={`h-4 w-4 ${riskRating === 'LOW' ? 'text-emerald-500' : riskRating === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
            <span className={`text-xs font-bold ${riskRating === 'LOW' ? 'text-emerald-700' : riskRating === 'HIGH' ? 'text-rose-700' : 'text-amber-700'}`}>
              {lang === 'HI' ? 'जोखिम' : lang === 'BN' ? 'ঝুঁকি' : 'Risk'}: {riskRating}
            </span>
          </div>
          {recommendedModel && (
            <div className="mt-2 text-[11px] text-slate-700 font-medium bg-amber-50 rounded-md p-1.5">
              {lang === 'HI' ? 'सुझाया गया मॉडल' : lang === 'BN' ? 'প্রস্তাবিত মডেল' : 'Recommended Model'}: {recommendedModel}
            </div>
          )}
          {strengths.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {strengths.slice(0, 2).map((s, i) => (
                <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1">
                  <span className="text-emerald-500 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ─── Scheme & Next Step ─── */}
      {(displaySchemeName || nextStep) && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-900 text-white p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              {displaySchemeName && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">
                    {lang === 'HI' ? 'आवेदन करें इस योजना में' : lang === 'BN' ? 'এই প্রকল্পে আবেদন করুন' : 'Apply for this Scheme'}
                  </div>
                  <div className="mt-1 text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-400 shrink-0" />
                    {displaySchemeName}
                  </div>
                </div>
              )}
              {nextStep && (
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">
                    {lang === 'HI' ? 'अगला कदम' : lang === 'BN' ? 'পরবর্তী পদক্ষেপ' : 'Next Step'}
                  </div>
                  <div className="mt-1 text-sm text-slate-200 flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-brand-300 shrink-0" />
                    <span>{nextStep}</span>
                  </div>
                </div>
              )}
            </div>
            {displaySchemeUrl && (
              <a
                href={displaySchemeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-sm font-bold text-white transition-colors"
              >
                {lang === 'HI' ? 'आवेदन करें →' : lang === 'BN' ? 'আবেদন করুন →' : 'Apply Now →'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── 3 Quick Start Steps (from real action plan) ─── */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white/90 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
          {ps?.stepsHeader ?? 'How to Get Started (3 Easy Steps)'}
        </h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {/* Use REAL action plan if available, else translated defaults */}
          {firstMilestone && report.actionPlan?.milestones ? (
            report.actionPlan.milestones.slice(0, 3).map((m, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">{m.phase} ({m.dayRange})</span>
                  {m.tasks.slice(0, 2).map((task, ti) => (
                    <span key={ti} className="text-slate-600 text-[11px] leading-snug block mt-0.5">• {task}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <StepCard num={1} title={ps?.step1Title ?? '1. Arrange Raw Material & Spot'} desc={ps?.step1Desc ?? 'Connect with local suppliers and secure a clean workspace.'} />
              <StepCard num={2} title={ps?.step2Title ?? '2. Apply for Government Scheme'} desc={ps?.step2Desc ?? 'Take this report to your nearest Bank or CSC center.'} />
              <StepCard num={3} title={ps?.step3Title ?? '3. Secure 15 Regular Buyers'} desc={ps?.step3Desc ?? 'Talk to local residents before launch to guarantee Day-1 sales.'} />
            </>
          )}
        </div>
      </div>

      {/* ─── Documents Needed (from real funding checklist) ─── */}
      {fundingChecklist.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {lang === 'HI' ? '📋 बैंक में ले जाने वाले दस्तावेज़' : lang === 'BN' ? '📋 ব্যাংকে নিয়ে যাওয়ার কাগজপত্র' : '📋 Documents to Take to Bank'}
          </h4>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {fundingChecklist.slice(0, 8).map((doc, i) => (
              <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                {doc}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
        {num}
      </span>
      <div>
        <span className="font-bold text-slate-900 block">{title}</span>
        <span className="text-slate-600 text-[11px] leading-snug block mt-0.5">{desc}</span>
      </div>
    </div>
  );
}
