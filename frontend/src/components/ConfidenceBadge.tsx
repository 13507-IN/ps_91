import React from 'react';
import type { Confidence } from '@/types';

interface ConfidenceBadgeProps {
  confidence?: Confidence;
  level?: Confidence;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({ confidence, level }: ConfidenceBadgeProps) {
  const activeLevel = confidence ?? level ?? 'HIGH';
  const classMap: Record<Confidence, string> = {
    HIGH: 'badge-confidence-high',
    MEDIUM: 'badge-confidence-medium',
    LOW: 'badge-confidence-low',
  };
  const label: Record<Confidence, string> = {
    HIGH: 'High Confidence',
    MEDIUM: 'Medium Confidence',
    LOW: 'Low Confidence',
  };
  const dot: Record<Confidence, string> = {
    HIGH: 'bg-confidence-high',
    MEDIUM: 'bg-confidence-medium',
    LOW: 'bg-confidence-low',
  };
  return (
    <span className={classMap[activeLevel]}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[activeLevel]} inline-block`} />
      {label[activeLevel]}
    </span>
  );
}

export { ConfidenceBadge };