export function inr(value: number, compact = false): string {
  if (compact) {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function inrCompact(value: number): string {
  return inr(value, true);
}

export function compactNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

export function number(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function percentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export const percent = percentage;

export function confidenceToColor(confidence: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (confidence) {
    case 'HIGH': return 'var(--confidence-high)';
    case 'MEDIUM': return 'var(--confidence-medium)';
    case 'LOW': return 'var(--confidence-low)';
  }
}

export function gradeToColor(grade: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR'): string {
  switch (grade) {
    case 'EXCELLENT': return 'var(--grade-excellent)';
    case 'GOOD': return 'var(--grade-good)';
    case 'MODERATE': return 'var(--grade-moderate)';
    case 'POOR': return 'var(--grade-poor)';
  }
}

export const gradeColor: Record<string, string> = {
  EXCELLENT: 'stroke-emerald-500 text-emerald-600',
  GOOD: 'stroke-teal-500 text-teal-600',
  MODERATE: 'stroke-amber-500 text-amber-600',
  POOR: 'stroke-rose-500 text-rose-600',
};

export const gradeBadge: Record<string, string> = {
  EXCELLENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  GOOD: 'bg-teal-100 text-teal-800 border-teal-300',
  MODERATE: 'bg-amber-100 text-amber-800 border-amber-300',
  POOR: 'bg-rose-100 text-rose-800 border-rose-300',
};

export const decisionColor: Record<string, string> = {
  PROCEED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  MODIFY: 'bg-amber-100 text-amber-800 border-amber-300',
  INSUFFICIENT_DATA: 'bg-slate-100 text-slate-800 border-slate-300',
};

export const riskColor: Record<string, string> = {
  LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  HIGH: 'text-rose-600 bg-rose-50 border-rose-200',
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const dateTime = formatDate;