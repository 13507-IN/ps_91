'use client';
import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: readonly string[];
}

export default function WizardProgress({ currentStep, totalSteps, stepTitles }: WizardProgressProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-border shadow-gov-sm p-4 sm:p-5 xl:sticky xl:top-6">
      
      {/* --- Mobile View (Hidden on xl screens) --- */}
      <div className="xl:hidden">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-bold text-teal-900">Step {currentStep}: {stepTitles[currentStep - 1]}</span>
          <span className="text-ink-muted font-medium">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-saffron rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* --- Desktop Vertical Timeline (Hidden on smaller screens) --- */}
      <div className="hidden xl:block">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-5">
          {t.wizard.assessmentSteps}
        </h3>
        <div className="flex flex-col gap-0">
          {stepTitles.map((title, i) => {
            const stepNum = i + 1;
            const isComplete = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div key={`step-indicator-${stepNum}`} className="flex gap-3">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300 ${
                      isComplete
                        ? 'bg-flag-green text-white'
                        : isActive
                        ? 'bg-teal-900 text-white ring-4 ring-teal-900/20' :'bg-muted text-ink-subtle'
                    }`}
                  >
                    {isComplete ? <Check size={14} strokeWidth={2.5} /> : stepNum}
                  </div>
                  {i < stepTitles.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[24px] transition-colors duration-300 ${
                        isComplete ? 'bg-flag-green' : 'bg-border'
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-6">
                  <div
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-teal-900' : isComplete ? 'text-flag-green' : 'text-ink-subtle'
                    }`}
                  >
                    {title}
                  </div>
                  {isActive && (
                    <div className="text-xs text-ink-muted mt-0.5">{t.wizard.inProgress}</div>
                  )}
                  {isComplete && (
                    <div className="text-xs text-flag-green mt-0.5">{t.wizard.completed}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
            <span>{t.wizard.progress}</span>
            <span className="font-tabular font-medium">{Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-saffron rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}