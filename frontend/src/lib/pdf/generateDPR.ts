/**
 * ArthSetu — DPR (Detailed Project Report) PDF Generator
 *
 * Generates a structured, bank-ready PDF document from a FeasibilityReport.
 * Uses jsPDF for direct PDF rendering (no DOM capture needed).
 *
 * Structure:
 *  1. Cover Page (doc reference, promoter, key metrics)
 *  2. Table of Contents
 *  3. Executive Summary
 *  4. Project Overview & Promoter Details
 *  5. Market & Catchment Analysis
 *  6. Competition & Demand Assessment
 *  7. Operational Plan & Local Suppliers
 *  8. Financial Plan — Project Cost & Means of Finance
 *  9. Financial Plan — Cash Flow Projections (12 Months)
 * 10. Financial Plan — Loan Repayment Schedule
 * 11. Stress Test & Sensitivity Analysis
 * 12. Risk Assessment & Mitigation
 * 13. AI SWOT Analysis
 * 14. Project Recommendation
 * 15. Implementation Roadmap (30-Day Action Plan)
 * 16. Government Schemes & Subsidies
 * 17. Funding & Documentation Checklist
 * 18. Declaration & Undertaking
 */

import jsPDF from 'jspdf';
import type { FeasibilityReport } from '@/types';
import { inr, percentage, formatDate } from '@/lib/format';

// ── Colors ──
const TEAL = [13, 78, 73] as const;      // #0D4E49
const TEAL_DARK = [8, 52, 49] as const;  // darker teal for headers
const SAFFRON = [230, 92, 0] as const;   // #E65C00
const WHITE = [255, 255, 255] as const;
const GRAY_50 = [249, 250, 251] as const;
const GRAY_100 = [248, 250, 252] as const;
const GRAY_300 = [203, 213, 225] as const;
const GRAY_600 = [71, 85, 105] as const;
const GRAY_700 = [51, 65, 85] as const;
const BLACK = [15, 23, 42] as const;
const GREEN = [16, 124, 65] as const;
const RED = [190, 50, 50] as const;
const TEAL_TINT = [232, 241, 239] as const;

type RGB = readonly [number, number, number];

// ── Layout constants (mm) ──
const MARGIN_X = 20;
const CONTENT_W = 170;
const BOTTOM = 268;

// ── Applicant / promoter details supplied at export time ──
export interface DPRApplicant {
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  category?: string;
  dateOfBirth?: string;
  village?: string;
  block?: string;
  district?: string;
  state?: string;
}

// ── TOC entries ──
interface TocEntry {
  num: string;
  title: string;
  page: number;
}

// ── Low-level helpers ──
function setColor(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function drawLine(doc: jsPDF, y: number, color: RGB = GRAY_300, fromX = MARGIN_X, toX = 210 - MARGIN_X) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  doc.line(fromX, y, toX, y);
}

function ensureSpace(doc: jsPDF, y: number, needed: number, top = 20): number {
  if (y + needed > BOTTOM) {
    doc.addPage();
    return top;
  }
  return y;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function drawTextBox(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineH: number): number {
  const lines = wrapText(doc, text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

// ── Composite helpers ──

function sectionTitle(
  doc: jsPDF,
  y: number,
  num: string,
  title: string,
  toc?: TocEntry[],
): number {
  y = ensureSpace(doc, y, 20, 20);
  if (toc) {
    toc.push({ num, title, page: doc.getNumberOfPages() });
  }
  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, TEAL);
  doc.text(`${num}. ${title}`, MARGIN_X, y);
  doc.setFillColor(SAFFRON[0], SAFFRON[1], SAFFRON[2]);
  doc.rect(MARGIN_X, y + 2, 170, 0.8, 'F');
  return y + 10;
}

function subHeading(doc: jsPDF, y: number, text: string, color: RGB = GRAY_700, size = 10): number {
  y = ensureSpace(doc, y, 12, 20);
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, color);
  doc.text(text, MARGIN_X, y);
  return y + 5;
}

function kvRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  x = MARGIN_X,
  labelW = 62,
  vx = MARGIN_X, // value column x
  valueW = 100,
): number {
  y = ensureSpace(doc, y, 8, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRAY_600);
  const labelLines = wrapText(doc, label, labelW);
  doc.text(labelLines, x, y);
  doc.setFont('helvetica', 'bold');
  setColor(doc, BLACK);
  const valueLines = wrapText(doc, value ?? '—', valueW);
  const lineH = 4.4;
  const h = Math.max(labelLines.length, valueLines.length) * lineH;
  doc.text(valueLines, vx, y);
  return y + h + 1.5;
}

function bulletList(
  doc: jsPDF,
  items: string[],
  y: number,
  x = MARGIN_X + 3,
  maxWidth = CONTENT_W - 8,
  lineH = 4.6,
  prefix = '•',
  color: RGB = BLACK,
  limit?: number,
): number {
  const list = limit ? items.slice(0, limit) : items;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, color);
  for (const item of list) {
    y = ensureSpace(doc, y, 7, 20);
    const lines = wrapText(doc, item, maxWidth - 5);
    doc.text(prefix, x - 4, y);
    doc.text(lines, x, y);
    y += lines.length * lineH;
  }
  return y;
}

/**
 * Renders a bordered table with a coloured header row and zebra striping.
 * Returns the next y position.
 */
function renderTable(
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: (string | number)[][],
  colWidths: number[],
  opts: {
    x?: number;
    rowH?: number;
    fontSize?: number;
    headerBg?: RGB;
    headerFg?: RGB;
    zebra?: boolean;
    align?: Array<'L' | 'C' | 'R'>;
    totalRow?: boolean;
    totalBg?: RGB;
    totalFg?: RGB;
  } = {},
): number {
  const x = opts.x ?? MARGIN_X;
  const rowH = opts.rowH ?? 7;
  const fs = opts.fontSize ?? 8;
  const headerBg = opts.headerBg ?? TEAL;
  const headerFg = opts.headerFg ?? WHITE;
  const zebra = opts.zebra ?? true;
  const aligns = opts.align ?? headers.map(() => 'L' as const);
  const headerH = rowH + 3;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  function drawTextRow(parts: (string | number)[], top: number, color: RGB, bold: boolean, fsize: number) {
    doc.setFontSize(fsize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    setColor(doc, color);
    let cx = x;
    for (let i = 0; i < parts.length; i++) {
      const w = colWidths[i];
      const a = aligns[i] ?? 'L';
      const ax = a === 'R' ? cx + w - 2 : a === 'C' ? cx + w / 2 : cx + 2;
      doc.text(String(parts[i]), ax, top + rowH / 2, {
        align: a === 'R' ? 'right' : a === 'C' ? 'center' : 'left',
      } as const);
      cx += w;
    }
  }

  y = ensureSpace(doc, y, headerH + rowH, 20);
  setFill(doc, headerBg);
  doc.rect(x, y, totalW, headerH, 'F');
  doc.setFontSize(fs);
  doc.setFont('helvetica', 'bold');
  setColor(doc, headerFg);
  let cx = x;
  for (let i = 0; i < headers.length; i++) {
    const w = colWidths[i];
    const a = aligns[i] ?? 'L';
    const ax = a === 'R' ? cx + w - 2 : a === 'C' ? cx + w / 2 : cx + 2;
    doc.text(headers[i], ax, y + headerH / 2, {
      align: a === 'R' ? 'right' : a === 'C' ? 'center' : 'left',
    } as const);
    cx += w;
  }
  y += headerH;

  for (let i = 0; i < rows.length; i++) {
    y = ensureSpace(doc, y, rowH, 20);
    const isTotal = opts.totalRow && i === rows.length - 1;
    if (zebra && i % 2 === 1 && !isTotal) {
      setFill(doc, GRAY_100);
      doc.rect(x, y, totalW, rowH, 'F');
    }
    if (isTotal) {
      setFill(doc, opts.totalBg ?? TEAL_TINT);
      doc.rect(x, y, totalW, rowH, 'F');
      drawLine(doc, y + rowH, opts.totalBg ?? TEAL);
    }
    drawTextRow(rows[i], y, isTotal ? (opts.totalFg ?? TEAL_DARK) : BLACK, Boolean(isTotal), isTotal ? fs + 0.5 : fs);
    y += rowH;
  }
  return y + 2;
}

/**
 * 3-column "stat card" strip. Items: {label, value}.
 */
function statStrip(doc: jsPDF, y: number, items: Array<{ label: string; value: string }>): number {
  const gap = 4;
  const w = (CONTENT_W - gap * 2) / 3;
  const h = 16;
  y = ensureSpace(doc, y, h, 20);
  for (let i = 0; i < items.length; i++) {
    const x = MARGIN_X + i * (w + gap);
    setFill(doc, GRAY_100);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    doc.setFontSize(6.4);
    doc.setFont('helvetica', 'normal');
    setColor(doc, GRAY_600);
    doc.text(items[i].label, x + 4, y + 4);
    doc.setFontSize(8.6);
    doc.setFont('helvetica', 'bold');
    setColor(doc, TEAL);
    const vLines = wrapText(doc, items[i].value, w - 8);
    doc.text(vLines.slice(0, 2), x + 4, y + 10.5);
  }
  return y + h + 5;
}

// ── Section 9 data prep ──

function getProjections(report: FeasibilityReport) {
  const proj = (report.financialPlan?.cashflow?.projections ?? []) as Array<{
    month?: number;
    revenue?: number;
    operatingCosts?: number;
    emi?: number;
    netCashflow?: number;
    cumulativeCashflow?: number;
  }>;
  return proj;
}

function calcAverages(report: FeasibilityReport) {
  const proj = getProjections(report);
  const avgRevenue = proj.length ? proj.reduce((a, p) => a + (p.revenue ?? 0), 0) / proj.length : 0;
  const avgOpCost = proj.length ? proj.reduce((a, p) => a + ((p.operatingCosts ?? 0) + (p.emi ?? 0)), 0) / proj.length : 0;
  const fp = report.financialPlan;
  const avgNet =
    (fp?.cashflow?.averageMonthlyCashflow ?? 0) ||
    (proj.length ? proj.reduce((a, p) => a + (p.netCashflow ?? 0), 0) / proj.length : 0);
  const emi = fp?.emi?.emi ?? 0;
  const dscr = emi > 0 && avgNet > 0 ? avgNet / emi : 0;
  return { proj, avgRevenue, avgOpCost, avgNet, emi, dscr };
}

function getCategoryLabel(category: string): string {
  if (!category) return 'Proposed Enterprise';
  return (
    category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()) + ' Enterprise'
  );
}

// ── Main document builder ──

function buildDocument(
  report: FeasibilityReport,
  applicant: DPRApplicant | undefined,
  tocList: TocEntry[] | null,
  finalPass: boolean,
): { doc: jsPDF; toc: TocEntry[] } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const toc: TocEntry[] = [];
  const fp = report.financialPlan;
  const rec = report.aiRecommendation;
  const risk = report.riskAssessment;
  const comp = report.competitorAnalysis;
  const opp = report.opportunityAnalysis;
  const mi = report.marketIntelligence;
  const { avgNet, emi, dscr } = calcAverages(report);
  const catLabel = getCategoryLabel(report.businessCategory);
  const reportDate = report.createdAt
    ? formatDate(report.createdAt)
    : new Date().toLocaleDateString('en-IN');
  const ref = `AS/DPR/${new Date().getFullYear()}/${String(report.id ?? Date.now()).slice(0, 6).toUpperCase()}`;

  // ═══════════════════ PAGE 1: COVER ═══════════════════
  setFill(doc, TEAL);
  doc.rect(0, 0, 210, 78, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, WHITE);
  doc.text('ArthSetu', MARGIN_X, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(reportDate, 190, 14, { align: 'right' });

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Project Report', 105, 32, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [220, 238, 234]);
  doc.text('Business Feasibility, Funding & Loan Assessment', 105, 42, { align: 'center' });

  setFill(doc, SAFFRON);
  doc.rect(70, 49, 70, 1.6, 'F');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setColor(doc, WHITE);
  doc.text(catLabel, 105, 58, { align: 'center' });

  if (applicant?.name) {
    doc.setFontSize(10);
    setColor(doc, [245, 250, 248]);
    doc.text(`Prepared for: ${applicant.name}`, 105, 68, { align: 'center' });
    if (applicant.district || applicant.state) {
      doc.setFontSize(8.5);
      doc.text(
        `${[applicant.village, applicant.block, applicant.district, applicant.state].filter(Boolean).join(', ')}`,
        105,
        74,
        { align: 'center' },
      );
    }
  }

  // Cover body
  let y = 92;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRAY_600);
  doc.text(`Document Reference: ${ref}`, MARGIN_X, y);
  y = kvRow(doc, 'Generated On', reportDate, y + 2);
  y = kvRow(doc, 'Recommended Scheme', fp?.matchedSchemeName ?? '—', y);
  y += 2;

  // Business idea block
  y = ensureSpace(doc, y, 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, TEAL);
  doc.text('Business Idea', MARGIN_X, y);
  y += 5;
  setFill(doc, GRAY_50);
  doc.roundedRect(MARGIN_X, y - 3, CONTENT_W, 28, 3, 3, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, BLACK);
  const ideaLines = wrapText(doc, report.businessIdea || 'N/A', CONTENT_W - 10);
  doc.text(ideaLines.slice(0, 4), MARGIN_X + 5, y);
  y += Math.min(4, ideaLines.length) * 4.8 + 4;
  y += 6;

  // Key metrics grid (2 × 4)
  const metrics: Array<[string, string]> = [
    ['Viability Score', `${report.feasibilityScore.totalScore}/100 (${report.feasibilityScore.grade})`],
    ['Project Cost', inr(fp.projectCost)],
    ["Promoter's Margin", `${inr(fp.availableCapital)} (${fp.marginPercentage}%)`],
    ['Govt. Subsidy', inr(fp.subsidyAmount)],
    ['Loan Requested', inr(fp.netLoanAmount)],
    ['Monthly Instalment', inr(fp.emi.emi)],
    ['Break-even', fp.breakEven.breakEvenMonth ? `Month ${fp.breakEven.breakEvenMonth}` : 'N/A'],
    ['Interest (p.a.)', `${fp.interestRate}%`],
  ];

  y = ensureSpace(doc, y, metrics.length * 8 + 14, 20);
  const gridTop = y;
  setFill(doc, GRAY_100);
  doc.roundedRect(20, gridTop, CONTENT_W, metrics.length / 2 * 8.4 + 8, 3, 3, 'F');

  const colX = [26, 112];
  let gy = gridTop + 5;
  for (let row = 0; row < metrics.length / 2; row++) {
    for (let col = 0; col < 2; col++) {
      const [label, value] = metrics[row * 2 + col];
      const x = colX[col];
      doc.setFontSize(6.6);
      doc.setFont('helvetica', 'normal');
      setColor(doc, GRAY_600);
      doc.text(label, x, gy + 2.4);
      doc.setFontSize(8.4);
      doc.setFont('helvetica', 'bold');
      setColor(doc, BLACK);
      doc.text(value, Math.min(x + 55, 195), gy + 6.6);
    }
    gy += 8.4;
  }
  y = gridTop + metrics.length / 2 * 8.4 + 10;

  y += 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRAY_700);
  doc.text(
    `Confidence: ${report.confidence}  |  AI Decision: ${rec.decision}  |  Viability Score: ${rec.viabilityScore}/100`,
    105,
    y,
    { align: 'center' },
  );
  y += 5;
  doc.setFontSize(7.5);
  setColor(doc, GRAY_600);
  doc.text(
    `This DPR has been prepared to support a loan application under the ${fp.matchedSchemeName ?? 'recommended'} scheme.`,
    105,
    y,
    { align: 'center' },
  );

  // ═══════════════════ PAGE 2: TABLE OF CONTENTS ═══════════════════
  if (tocList) {
    doc.addPage();
    y = 22;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    setColor(doc, TEAL);
    doc.text('Table of Contents', MARGIN_X, y);
    setFill(doc, SAFFRON);
    doc.rect(MARGIN_X, y + 2, 60, 1, 'F');
    y += 12;

    for (const t of tocList) {
      y = ensureSpace(doc, y, 7.5, 22);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      setColor(doc, TEAL);
      doc.text(`${t.num}.`, MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      setColor(doc, BLACK);
      doc.text(t.title, MARGIN_X + 8, y);
      doc.setFont('helvetica', 'bold');
      setColor(doc, GRAY_600);
      doc.text(String(t.page), 190, y, { align: 'right' });
      y += 7;
    }
  }

  // ═══════════════════ PAGE: EXECUTIVE SUMMARY ═══════════════════
  y = 20;
  doc.addPage();
  y = sectionTitle(doc, y, 'A', 'Executive Summary', !tocList ? toc : undefined);

  // Stat strip 1
  y = statStrip(doc, y, [
    { label: 'Total Project Cost', value: inr(fp.projectCost) },
    { label: 'Loan Requested', value: inr(fp.netLoanAmount) },
    { label: 'Monthly Instalment', value: inr(emi) },
  ]);
  y = statStrip(doc, y, [
    { label: "Promoter's Margin", value: `${inr(fp.availableCapital)} (${fp.marginPercentage}%)` },
    { label: 'Est. Surplus / Month', value: inr(avgNet) },
    { label: 'Break-even', value: fp.breakEven.breakEvenMonth ? `Month ${fp.breakEven.breakEvenMonth}` : 'N/A' },
  ]);
  y += 2;

  const summaryPara =
    `ArthSetu has assessed the proposed ${report.businessCategory.replace(/_/g, ' ').toLowerCase()} business for viability within a ` +
    `${mi.catchmentRadiusKm} km catchment covering ${mi.totalPopulation.toLocaleString('en-IN')} people ` +
    `across ${mi.totalHouseholds.toLocaleString('en-IN')} households. The project is estimated to cost ` +
    `${inr(fp.projectCost)}, of which the promoter will contribute ${inr(fp.availableCapital)} ` +
    `(${fp.marginPercentage}%) as margin money, a government subsidy of ${inr(fp.subsidyAmount)} is available, ` +
    `and a bank loan of ${inr(fp.netLoanAmount)} is proposed under the ${fp.matchedSchemeName ?? 'recommended'} ` +
    `scheme at ${fp.interestRate}% p.a. over ${fp.tenureMonths} months. Based on projected cash flows, the ` +
    `average monthly surplus after loan repayment is ${inr(Math.round(avgNet))}, equivalent to a Debt Service ` +
    `Coverage Ratio (DSCR) of approximately ${dscr > 0 ? dscr.toFixed(2) : 'not serviceable'}x. The venture is ` +
    `expected to break even by month ${fp.breakEven.breakEvenMonth ?? 'N/A'}. Overall the proposal is rated ` +
    `'${report.feasibilityScore.grade}' (${report.feasibilityScore.totalScore}/100) with ${report.confidence} ` +
    `confidence, and the AI recommendation is to ${rec.decision}.`;

  y = ensureSpace(doc, y, 14, 20);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, BLACK);
  const paraLines = wrapText(doc, summaryPara, CONTENT_W);
  doc.text(paraLines, MARGIN_X, y);
  y += paraLines.length * 4.8 + 3;

  y = subHeading(doc, y, 'Key Strengths', GREEN);
  y = bulletList(doc, rec.strengths.slice(0, 4), y, MARGIN_X + 3, CONTENT_W - 8, 4.6, '+', GREEN);

  y += 3;
  y = ensureSpace(doc, y, 12, 20);
  setFill(doc, TEAL_TINT);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 11, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  setColor(doc, TEAL_DARK);
  const foot = wrapText(doc, 'Prepared by ArthSetu — AI-driven rural business feasibility & loan advisory platform. Data sources: Census of India, AGMARKNET, LGD & district records.', CONTENT_W - 12);
  doc.text(foot, MARGIN_X + 6, y + 6);
  y += 14;

  // ═══════════════════ SECTIONS 1-2 ═════════════════════════
  doc.addPage();
  y = 20;

  // 1. Project Overview & Promoter Details
  y = sectionTitle(doc, y, '1', 'Project Overview & Promoter Details', tocList ? undefined : toc);
  y = kvRow(doc, 'Business Venture', catLabel, y);
  y = kvRow(doc, 'Business Category', report.businessCategory.replace(/_/g, ' '), y);
  y = kvRow(doc, 'Location (Catchment)', mi.catchmentRadiusKm ? `${mi.catchmentRadiusKm} km radius` : '—', y);
  y = kvRow(doc, 'Proposed Investment', inr(fp.projectCost), y);
  y = kvRow(doc, 'Recommended Business Model', opp.recommendedModel ?? '—', y);
  y += 2;

  y = subHeading(doc, y, 'Business Idea', TEAL);
  y = drawTextBox(doc, report.businessIdea || 'N/A', MARGIN_X, y, CONTENT_W, 4.8);
  y += 2;

  y = subHeading(doc, y, 'Promoter Profile', TEAL);

  const promoterCols = [95, 75];
  const promoterHeaders = ['Particular', 'Details'];
  const promoterRows: (string | number)[][] = [
    ['Name of Applicant', applicant?.name ?? '______________________'],
    ['Contact Number', applicant?.phone ?? '______________________'],
    ['Email', applicant?.email ?? '______________________'],
    ['Gender', applicant?.gender ? applicant.gender.charAt(0) + applicant.gender.slice(1).toLowerCase() : '___'],
    ['Category', applicant?.category ?? '___'],
    ['Date of Birth', applicant?.dateOfBirth ? formatDate(applicant.dateOfBirth) : '__ / __ / ______'],
    [
      'Address',
      [applicant?.village, applicant?.block, applicant?.district, applicant?.state].filter(Boolean).join(', ') ||
        '________________________________',
    ],
  ];
  y = renderTable(doc, y, promoterHeaders, promoterRows, promoterCols, {
    rowH: 7.5,
    fontSize: 8.5,
    headerBg: TEAL,
  });
  y += 3;

  // 2. Market & Catchment Analysis
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '2', 'Market & Catchment Analysis', tocList ? undefined : toc);

  y = subHeading(doc, y, 'Catchment Profile', TEAL);
  y = kvRow(doc, 'Catchment Radius', `${mi.catchmentRadiusKm} km`, y);
  y = kvRow(doc, 'Total Population', mi.totalPopulation.toLocaleString('en-IN'), y);
  y = kvRow(doc, 'Total Households', mi.totalHouseholds.toLocaleString('en-IN'), y);
  y = kvRow(doc, 'Literacy Rate', percentage(mi.literacyRate), y);
  y += 1;

  if (mi.topCrops && mi.topCrops.length > 0) {
    const cropNames = mi.topCrops
      .map((c) => (typeof c === 'string' ? c : (c as { cropName?: string }).cropName ?? ''))
      .filter(Boolean)
      .join(', ');
    y = kvRow(doc, 'Top Crops', cropNames, y, MARGIN_X, 62, MARGIN_X, 90);
  }

  const livs = mi.livestock ?? {};
  const livestockLabels = Object.keys(livs);
  if (livestockLabels.length > 0) {
    y = kvRow(
      doc,
      'Livestock Base',
      livestockLabels
        .slice(0, 5)
        .map((k) => `${k}: ${String(livs[k])}`)
        .join(', '),
      y,
      MARGIN_X,
      62,
      MARGIN_X,
      90,
    );
  }

  const infra = (mi.infrastructure ?? {}) as Record<string, unknown>;
  if (Object.keys(infra).length > 0) {
    y += 1;
    y = subHeading(doc, y, 'Infrastructure', TEAL);
    if (infra.hasAllWeatherRoad !== undefined) {
      y = kvRow(doc, 'All-Weather Road', infra.hasAllWeatherRoad ? 'Yes' : 'No', y);
    }
    if (typeof infra.nearestTownDistanceKm === 'number') {
      y = kvRow(doc, 'Nearest Town', `${infra.nearestTownDistanceKm} km`, y);
    }
    if (typeof infra.nearbyMarketDistanceKm === 'number') {
      y = kvRow(doc, 'Nearby Market', `${infra.nearbyMarketDistanceKm} km`, y);
    }
  }

  const amenities = mi.amenitiesCount ?? {};
  const amenityLabels = Object.keys(amenities);
  if (amenityLabels.length > 0) {
    y += 1;
    y = subHeading(doc, y, 'Local Amenities', TEAL);
    y = drawTextBox(
      doc,
      amenityLabels
        .slice(0, 8)
        .map((k) => `${k.replace(/_/g, ' ')}: ${amenities[k]}`)
        .join('  •  '),
      MARGIN_X,
      y,
      CONTENT_W,
      4.6,
    );
  }

  y += 2;
  y = ensureSpace(doc, y, 12, 20);
  setFill(doc, [240, 246, 244]);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, TEAL_DARK);
  doc.text(`Data Confidence: ${mi.confidence}`, MARGIN_X + 6, y + 6.5);
  y += 14;

  // 3. Competition & Demand Assessment
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '3', 'Competition & Demand Assessment', tocList ? undefined : toc);

  y = subHeading(doc, y, 'Competitive Landscape', TEAL);
  y = kvRow(doc, 'Observed Competitors', String(comp.totalObserved), y);
  y = kvRow(doc, 'Reported (Community)', String(comp.totalReported), y);
  y = kvRow(doc, 'Estimated Total', `${comp.totalEstimatedMin}–${comp.totalEstimatedMax}`, y);
  y = kvRow(doc, 'Density (per sq km)', comp.densityPerSqKm.toFixed(3), y);
  y = kvRow(doc, 'Data Confidence', comp.confidence, y);

  if (comp.competitors.length > 0) {
    y += 1;
    y = subHeading(doc, y, 'Known Competitors', TEAL);
    const compRows = comp.competitors
      .slice(0, 6)
      .map((c) => [c.name, c.scale, `${c.distance.toFixed(1)} km`]);
    y = renderTable(
      doc,
      y,
      ['Competitor', 'Scale', 'Distance'],
      compRows,
      [95, 35, 40],
      { rowH: 7, fontSize: 8, headerBg: TEAL },
    );
  }

  y += 3;
  y = subHeading(doc, y, 'Demand & Market Gap', SAFFRON);
  if (typeof opp.estimatedDailyDemandUnits === 'number') {
    y = kvRow(doc, 'Estimated Daily Demand', `${opp.estimatedDailyDemandUnits.toLocaleString('en-IN')} ${opp.unit ?? 'units'}`, y);
  }
  if (typeof opp.estimatedAnnualDemandUnits === 'number') {
    y = kvRow(doc, 'Estimated Annual Demand', `${opp.estimatedAnnualDemandUnits.toLocaleString('en-IN')} ${opp.unit ?? 'units'}`, y);
  }
  y = kvRow(doc, 'Opportunity Score', `${opp.opportunityScore}/100`, y);
  y = kvRow(doc, 'Recommended Model', opp.recommendedModel ?? '—', y);

  if (opp.marketGaps.length > 0) {
    y += 1;
    y = subHeading(doc, y, 'Identified Gaps & Opportunities', TEAL);
    y = bulletList(doc, opp.marketGaps.slice(0, 6), y, MARGIN_X + 3, CONTENT_W - 8, 4.8, '▸', BLACK);
  }

  // 4. Operational Plan & Local Suppliers
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '4', 'Operational Plan & Local Suppliers', tocList ? undefined : toc);

  y = subHeading(doc, y, 'Proposed Operations', TEAL);
  y = drawTextBox(
    doc,
    `The ${catLabel} unit will be operated from a location selected by the promoter, leveraging a ${mi.catchmentRadiusKm} km hyper-local catchment for both input sourcing and sales. Raw materials and ancillary inputs will be procured from verified local suppliers, and finished output will be sold within the catchment and nearby mandis.`,
    MARGIN_X,
    y,
    CONTENT_W,
    4.8,
  );
  y += 2;

  if (report.localSuppliers && report.localSuppliers.length > 0) {
    y = subHeading(doc, y, 'Verified Local Suppliers', TEAL);
    const supRows = report.localSuppliers
      .slice(0, 8)
      .map((s) => [s.name ?? '—', s.subcategory ?? s.category.replace(/_/g, ' '), `${s.distance.toFixed(1)} km`]);
    y = renderTable(
      doc,
      y,
      ['Supplier', 'Category / Input', 'Distance'],
      supRows,
      [80, 50, 40],
      { rowH: 7, fontSize: 8, headerBg: TEAL },
    );
  } else {
    y += 1;
    y = drawTextBox(
      doc,
      `Supplier mapping will be finalised during implementation. For indicative planning, benchmark vendor profiles for ${catLabel} (feed, equipment, raw material) are available in the annexure.`,
      MARGIN_X,
      y,
      CONTENT_W,
      4.8,
    );
  }

  y += 3;
  y = subHeading(doc, y, 'Working Arrangement', TEAL);
  y = kvRow(doc, 'Working Capital Required', inr(fp.workingCapital.requiredWorkingCapital), y);
  y = kvRow(doc, 'Working Capital Coverage', `${fp.workingCapital.monthsCovered} months`, y);

  // 5. Financial Plan — Project Cost & Means of Finance
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '5', 'Financial Plan — Project Cost & Means of Finance', tocList ? undefined : toc);

  const cost = fp.projectCost;
  const financeRows: (string | number)[][] = [
    ["Promoter's Contribution (Margin Money)", inr(fp.availableCapital), cost > 0 ? `${Math.round((fp.availableCapital / cost) * 100)}%` : '—'],
    ['Government Subsidy', inr(fp.subsidyAmount), cost > 0 ? `${Math.round((fp.subsidyAmount / cost) * 100)}%` : '—'],
    ['Bank Loan Required', inr(fp.netLoanAmount), cost > 0 ? `${Math.round((fp.netLoanAmount / cost) * 100)}%` : '—'],
    ['Total Project Cost', inr(cost), '100%'],
  ];
  y = renderTable(
    doc,
    y,
    ['Means of Finance', 'Amount (Rs.)', '% of Cost'],
    financeRows,
    [80, 50, 40],
    {
      rowH: 7.5,
      fontSize: 8.5,
      headerBg: TEAL,
      align: ['L', 'R', 'C'],
      totalRow: true,
    },
  );
  y += 3;

  y = subHeading(doc, y, 'Loan & Repayment Parameters', TEAL);
  y = kvRow(doc, 'Recommended Scheme', fp.matchedSchemeName, y);
  y = kvRow(doc, 'Interest Rate', `${fp.interestRate}% p.a.`, y);
  y = kvRow(doc, 'Loan Tenure', `${fp.tenureMonths} months`, y);
  y = kvRow(doc, 'Monthly Instalment (EMI)', inr(emi), y);
  y = kvRow(doc, 'Total Interest Payable', inr(fp.emi.totalInterest), y);
  y = kvRow(doc, 'Total Repayment', inr(fp.emi.totalPayment), y);

  y += 2;
  y = ensureSpace(doc, y, 12, 20);
  setFill(doc, dscr >= 1.25 ? [232, 245, 233] : dscr > 0 ? [251, 243, 219] : [253, 232, 229]);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 11, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, BLACK);
  doc.text(
    `Debt Service Coverage Ratio (DSCR) ≈ ${dscr > 0 ? dscr.toFixed(2) : 'Not serviceable - see stress test'}`,
    MARGIN_X + 6,
    y + 5.5,
  );
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRAY_700);
  doc.text(
    dscr >= 1.25
      ? 'Above the 1.25x benchmark typically required by banks — strong repayment capacity.'
      : dscr > 0
        ? 'Below the 1.25x benchmark — promoter advised to strengthen margin money or revisit pricing.'
        : 'Projected cash surplus is negative; proposal should be reviewed before submission.',
    MARGIN_X + 6,
    y + 10,
  );
  y += 16;

  // 6. Financial Plan — Cash Flow Projections (12 months)
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '6', 'Financial Plan — Cash Flow Projections (12 Months)', tocList ? undefined : toc);

  const proj = getProjections(report);
  const cfRows = proj.map((p, i) => [
    p.month ?? i + 1,
    inr(p.revenue ?? 0),
    inr(p.operatingCosts ?? 0),
    inr(p.emi ?? 0),
    inr(p.netCashflow ?? 0),
    inr(p.cumulativeCashflow ?? 0),
  ]);

  if (cfRows.length > 0) {
    const sum = (getter: (p: (typeof proj)[number]) => number) => proj.reduce((a, p) => a + (getter(p) ?? 0), 0);
    const totalRevenue = sum((p) => p.revenue ?? 0);
    const totalCost = sum((p) => p.operatingCosts ?? 0);
    const totalEmi = sum((p) => p.emi ?? 0);
    const totalNet = sum((p) => p.netCashflow ?? 0);
    cfRows.push(['TOTAL', inr(totalRevenue), inr(totalCost), inr(totalEmi), inr(totalNet), '']);
    y = renderTable(
      doc,
      y,
      ['Month', 'Revenue', 'Op. Cost', 'EMI', 'Net CF', 'Cumulative'],
      cfRows,
      [24, 33, 33, 27, 30, 23],
      {
        rowH: 7,
        fontSize: 7,
        headerBg: TEAL,
        align: ['C', 'R', 'R', 'R', 'R', 'R'],
      },
    );
    y += 2;
    const firstMonthRevenue = proj.find((p) => (p.revenue ?? 0) > 0)?.revenue ?? proj[0]?.revenue ?? 0;
    y = drawTextBox(
      doc,
      `Projections are model-based estimates built from hyper-local demand and benchmark unit economics. Revenue ramps from ${inr(firstMonthRevenue)} in early months to steady-state levels as operations stabilise.`,
      MARGIN_X,
      y,
      CONTENT_W,
      4.4,
    );
  } else {
    y = drawTextBox(doc, 'Detailed 12-month cash-flow projection is not available for this report.', MARGIN_X, y, CONTENT_W, 4.6);
    y = kvRow(doc, 'Average Monthly Cash Flow', inr(fp.cashflow.averageMonthlyCashflow), y + 3);
  }

  // 7. Financial Plan — Loan Repayment Schedule
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '7', 'Financial Plan — Loan Repayment Schedule', tocList ? undefined : toc);

  const schedule = (fp.emi.schedule ?? []) as Array<{
    month?: number;
    principal?: number;
    interest?: number;
    balance?: number;
  }>;

  if (schedule.length > 0) {
    const showAll = schedule.length <= 12;
    const shown = showAll ? schedule : schedule.slice(0, 12);
    const sRows = shown.map((s) => [
      s.month ?? '',
      inr((s.principal ?? 0) + (s.interest ?? 0)),
      inr(s.principal ?? 0),
      inr(s.interest ?? 0),
      inr(s.balance ?? 0),
    ]);
    sRows.push(['TOTAL', inr(fp.emi.totalPayment), inr(fp.netLoanAmount), inr(fp.emi.totalInterest), '']);
    y = renderTable(
      doc,
      y,
      ['Month', 'EMI', 'Principal', 'Interest', 'Outstanding Balance'],
      sRows,
      [24, 34, 34, 34, 44],
      {
        rowH: 7,
        fontSize: 7.5,
        headerBg: TEAL,
        align: ['C', 'R', 'R', 'R', 'R'],
      },
    );
    if (!showAll) {
      y += 1;
      y = drawTextBox(
        doc,
        `Showing the first 12 instalments of a ${schedule.length}-month repayment plan. The complete amortisation schedule is available on request from ArthSetu.`,
        MARGIN_X,
        y,
        CONTENT_W,
        4.4,
      );
    }

    y += 3;
    y = subHeading(doc, y, 'Repayment Summary', TEAL);
    y = kvRow(doc, 'Total Loan Amount', inr(fp.netLoanAmount), y);
    y = kvRow(doc, 'Total Interest', inr(fp.emi.totalInterest), y);
    y = kvRow(doc, 'Total Repayment (Principal + Interest)', inr(fp.emi.totalPayment), y);
  } else {
    y = kvRow(doc, 'Monthly Instalment', inr(emi), y);
    y = kvRow(doc, 'Total Interest', inr(fp.emi.totalInterest), y);
    y = kvRow(doc, 'Total Repayment', inr(fp.emi.totalPayment), y);
  }

  // 8. Stress Test & Sensitivity Analysis
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '8', 'Stress Test & Sensitivity Analysis', tocList ? undefined : toc);

  const stressRows: (string | number)[][] = [
    [
      fp.stressTest.base.name,
      '0%',
      '0%',
      inr(fp.stressTest.base.monthlyNetCashflow),
      fp.stressTest.base.canServiceDebt ? '✓ Yes' : '✗ No',
    ],
    ...fp.stressTest.scenarios.map((s) => [
      s.name,
      `${(s.revenueChange * 100).toFixed(0)}%`,
      `${(s.costChange * 100).toFixed(0)}%`,
      inr(s.monthlyNetCashflow),
      s.canServiceDebt ? '✓ Yes' : '✗ No',
    ]),
  ];
  y = renderTable(
    doc,
    y,
    ['Scenario', 'Revenue Δ', 'Cost Δ', 'Net Cash Flow', 'Servicing OK?'],
    stressRows,
    [60, 25, 25, 32, 28],
    {
      rowH: 7.5,
      fontSize: 8,
      headerBg: SAFFRON,
      align: ['L', 'C', 'C', 'R', 'C'],
    },
  );
  y += 2;
  y = drawTextBox(
    doc,
    'The table above shows how the monthly net cash position changes under pessimistic and optimistic business conditions. The proposal is considered resilient if debt servicing remains feasible even in the most adverse scenario shown.',
    MARGIN_X,
    y,
    CONTENT_W,
    4.6,
  );

  // 9. Risk Assessment & Mitigation
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '9', 'Risk Assessment & Mitigation', tocList ? undefined : toc);

  y = kvRow(doc, 'Overall Risk Score', `${risk.overallRiskScore}/100`, y);
  y = kvRow(doc, 'Risk Rating', risk.riskRating, y);
  y += 2;

  for (const rf of risk.riskFactors.slice(0, 6)) {
    y = ensureSpace(doc, y, 18, 20);
    y += 1;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, GRAY_700);
    doc.text(`▸ ${rf.name}`, MARGIN_X, y);
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, GRAY_600);
    const mitLines = wrapText(doc, `Mitigation: ${rf.mitigation}`, CONTENT_W - 6);
    doc.text(mitLines, MARGIN_X + 4, y);
    y += mitLines.length * 4.2 + 3;
  }

  // 10. AI SWOT Analysis
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '10', 'AI SWOT Analysis', tocList ? undefined : toc);

  y = subHeading(doc, y, 'Strengths', GREEN);
  y = bulletList(doc, rec.strengths.slice(0, 5), y, MARGIN_X + 3, CONTENT_W - 8, 4.8, '+', GREEN);
  y += 3;
  y = subHeading(doc, y, 'Weaknesses & Constraints', RED);
  y = bulletList(doc, rec.weaknesses.slice(0, 5), y, MARGIN_X + 3, CONTENT_W - 8, 4.8, '−', RED);

  // 11. Project Recommendation
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '11', 'Project Recommendation', tocList ? undefined : toc);

  setFill(doc, TEAL_TINT);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 12, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, TEAL_DARK);
  doc.text(
    `Decision: ${rec.decision}   |   Viability Score: ${rec.viabilityScore}/100`,
    105,
    y + 5.5,
    { align: 'center' },
  );
  doc.setFontSize(8.5);
  setColor(doc, GRAY_700);
  doc.text(`Overall Feasibility Grade: ${report.feasibilityScore.grade}`, 105, y + 10.5, { align: 'center' });
  y += 16;

  y = drawTextBox(doc, rec.summary, MARGIN_X, y, CONTENT_W, 4.8);
  y += 3;

  if (rec.recommendedNextStep) {
    y = ensureSpace(doc, y, 14, 20);
    setFill(doc, [255, 244, 232]);
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 12, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, SAFFRON);
    doc.text('Recommended Next Step', MARGIN_X + 6, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(doc, BLACK);
    const nsLines = wrapText(doc, rec.recommendedNextStep, CONTENT_W - 14);
    doc.text(nsLines, MARGIN_X + 6, y + 10);
    y += nsLines.length * 4.4 + 14;
  }

  // 12. Implementation Roadmap (30-Day Action Plan)
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '12', 'Implementation Roadmap (30-Day Action Plan)', tocList ? undefined : toc);

  for (const milestone of report.actionPlan.milestones) {
    y = ensureSpace(doc, y, 26, 20);
    setFill(doc, TEAL);
    doc.roundedRect(MARGIN_X, y - 3, CONTENT_W, 8.5, 2, 2, 'F');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, WHITE);
    doc.text(`${milestone.phase}  (${milestone.dayRange})`, MARGIN_X + 4, y + 1.5);
    y += 9;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, BLACK);
    for (const task of milestone.tasks) {
      y = ensureSpace(doc, y, 6, 20);
      const tLines = wrapText(doc, `☐  ${task}`, CONTENT_W - 8);
      doc.text(tLines, MARGIN_X + 3, y);
      y += tLines.length * 4.3;
    }
    y += 3;
  }

  // 13. Government Schemes & Subsidies
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '13', 'Government Schemes & Subsidies', tocList ? undefined : toc);

  const eligibleSchemes = (report.schemeMatches ?? []).filter((s) => s.eligible);
  if (eligibleSchemes.length > 0) {
    for (const scheme of eligibleSchemes) {
      y = ensureSpace(doc, y, 24, 20);
      y += 1;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      setColor(doc, TEAL);
      doc.text(`✓  ${scheme.name}`, MARGIN_X, y);
      y += 5;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      setColor(doc, GRAY_700);
      doc.text(
        `Max Loan: ${inr(scheme.maxLoan)}  |  Interest: ${scheme.interestRate}% p.a.  |  Subsidy: ${inr(scheme.subsidyAmount)}`,
        MARGIN_X + 3,
        y,
      );
      y += 4;
      const reasonLines = wrapText(doc, `Eligibility: ${scheme.reason}`, CONTENT_W - 8);
      doc.text(reasonLines, MARGIN_X + 3, y);
      y += reasonLines.length * 4.2 + 4;
    }
  } else {
    y = drawTextBox(
      doc,
      'No currently eligible government schemes were identified for this profile. The promoter may still apply under general-purpose lending programmes with the recommended scheme below.',
      MARGIN_X,
      y,
      CONTENT_W,
      4.6,
    );
    y += 2;
    y = kvRow(doc, 'Recommended Scheme', fp.matchedSchemeName, y);
  }

  // 14. Funding & Documentation Checklist
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '14', 'Funding & Documentation Checklist', tocList ? undefined : toc);

  y = bulletList(doc, report.actionPlan.fundingReadinessChecklist, y, MARGIN_X + 3, CONTENT_W - 8, 5.2, '☐', BLACK);
  y += 3;
  y = subHeading(doc, y, 'Documents typically required by the bank', TEAL);
  y = bulletList(
    doc,
    [
      'This Detailed Project Report (DPR)',
      'Identity & address proof of the applicant (Aadhaar / PAN / Voter ID)',
      'Passport-size photographs of the applicant',
      'Bank statement / passbook (last 6 months)',
      'Land / premise ownership or lease documents',
      'Quotations for machinery & equipment',
      'Proof of income / IT returns, if available',
    ],
    y,
    MARGIN_X + 3,
    CONTENT_W - 8,
    5.2,
    '▪',
    GRAY_700,
  );

  // 15. Declaration & Undertaking
  doc.addPage();
  y = 20;
  y = sectionTitle(doc, y, '15', 'Declaration & Undertaking', tocList ? undefined : toc);

  y = drawTextBox(
    doc,
    `I, ${applicant?.name ?? '______________________'}, hereby declare that the information furnished in this Detailed Project Report is true and correct to the best of my knowledge and belief. I further undertake to utilise the loan amount strictly for the project described herein and to repay the instalments as per the repayment schedule agreed with the lending institution.`,
    MARGIN_X,
    y,
    CONTENT_W,
    5.4,
  );
  y += 3;
  y = drawTextBox(
    doc,
    `Project Location: ${[applicant?.village, applicant?.block, applicant?.district, applicant?.state].filter(Boolean).join(', ') || 'As per promoter details'}`,
    MARGIN_X,
    y,
    CONTENT_W,
    5.4,
  );
  y += 6;

  y = kvRow(doc, 'Applicant Name', applicant?.name ?? '______________________', y);
  y = kvRow(doc, 'Applicant Contact', applicant?.phone ?? '______________________', y);
  y = kvRow(doc, 'Date', '__ / __ / ________', y);
  y = kvRow(doc, 'Place', applicant?.district ?? '______________________', y);
  y += 8;

  y = ensureSpace(doc, y, 30, 20);
  // Signature blocks
  const sigW = 76;
  const gap = 8;
  const blocks: Array<{ title: string; lines: string[] }> = [
    { title: 'Applicant Signature', lines: ['(Signature of the Promoter)'] },
    { title: 'Bank Official', lines: ['(For Bank Use Only)'] },
  ];
  let bx = MARGIN_X + 19;
  for (const b of blocks) {
    setFill(doc, GRAY_50);
    doc.rect(bx, y, sigW, 26, 'F');
    doc.setDrawColor(GRAY_300[0], GRAY_300[1], GRAY_300[2]);
    doc.setLineWidth(0.4);
    doc.rect(bx, y, sigW, 26);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, TEAL_DARK);
    doc.text(b.title, bx + 4, y + 6);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setColor(doc, GRAY_600);
    doc.text(b.lines[0], bx + 4, y + 13);
    doc.line(bx + 4, y + 18, bx + sigW - 4, y + 18);
    bx += sigW + gap;
  }
  y += 32;

  y = ensureSpace(doc, y, 14, 20);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  setColor(doc, GRAY_600);
  const declFoot = wrapText(
    doc,
    'Declaration is made free from any misrepresentation. ArthSetu is a decision-support platform and does not guarantee loan sanction; final approval is at the sole discretion of the lending institution.',
    CONTENT_W,
  );
  doc.text(declFoot, MARGIN_X, y);
  y += declFoot.length * 4 + 3;

  // ── Footers & mini headers (final pass only) ──
  if (finalPass) {
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      setColor(doc, GRAY_600);
      doc.text(`ArthSetu DPR — Page ${p} of ${totalPages}`, 105, 290, { align: 'center' });
      doc.text(`Ref: ${ref}`, 20, 292);
      doc.text('Confidential — for loan appraisal purposes', 190, 292, { align: 'right' });
      if (p > 1) {
        doc.setFontSize(7);
        setColor(doc, GRAY_600);
        doc.text('ArthSetu — Detailed Project Report', 20, 10);
        doc.text(formatDate(report.createdAt ?? new Date().toISOString()), 190, 10, { align: 'right' });
        drawLine(doc, 12, GRAY_300);
      }
    }
  }

  return { doc, toc };
}

// ── Main Export ──
export async function generateDPR(
  report: FeasibilityReport,
  applicant?: DPRApplicant,
): Promise<Blob> {
  // Pass 1: build without TOC to discover section page numbers.
  const pass1 = buildDocument(report, applicant, null, false);
  const tocFinal = pass1.toc.map((t) => ({ ...t, page: t.page + 1 }));
  // Pass 2: build with TOC (inserts exactly one page) and final footers.
  const pass2 = buildDocument(report, applicant, tocFinal, true);
  return pass2.doc.output('blob');
}

/**
 * Generate and immediately download the DPR as a PDF file.
 */
export async function downloadDPR(
  report: FeasibilityReport,
  applicant?: DPRApplicant,
): Promise<void> {
  const blob = await generateDPR(report, applicant);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ArthSetu_DPR_${report.businessCategory}_${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Share via WhatsApp with a summary text.
 * On mobile, uses Web Share API to attach the PDF if available.
 * Falls back to WhatsApp deep link with text summary.
 */
export async function shareViaWhatsApp(
  report: FeasibilityReport,
  applicant?: DPRApplicant,
): Promise<void> {
  const summary = [
    `📋 *ArthSetu Detailed Project Report*`,
    ``,
    `🏪 Business: ${report.businessCategory.replace(/_/g, ' ')}`,
    `👤 Promoter: ${applicant?.name ?? '—'}`,
    `📊 Viability Score: ${report.feasibilityScore.totalScore}/100 (${report.feasibilityScore.grade})`,
    `💰 Project Cost: ${inr(report.financialPlan.projectCost)}`,
    `🏦 Loan Required: ${inr(report.financialPlan.netLoanAmount)} via ${report.financialPlan.matchedSchemeName}`,
    `📅 EMI: ${inr(report.financialPlan.emi.emi)}/month`,
    `✅ Decision: ${report.aiRecommendation.decision}`,
    ``,
    `Generated by ArthSetu — Bankable DPR for rural enterprises`,
  ].join('\n');

  // Try Web Share API with file (mobile)
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await generateDPR(report, applicant);
      const file = new File([blob], `ArthSetu_DPR_${report.businessCategory}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'ArthSetu Detailed Project Report',
          text: summary,
          files: [file],
        });
        return;
      }
    } catch {
      // Fall through to WhatsApp link
    }
  }

  // Fallback: WhatsApp deep link with text
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  window.open(whatsappUrl, '_blank');
}