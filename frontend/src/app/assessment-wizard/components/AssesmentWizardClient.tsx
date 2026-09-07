'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './WizardProgress';
import StepLocation from './StepLocation';
import StepBusiness from './StepBusiness';
import StepCapital from './StepCapital';
import StepReview from './StepReview';
import type { WizardDraft } from '@/types';

export const LAST_REPORT_KEY = 'udyamsetu-last-report';
const TOTAL_STEPS = 4;

const stepTitles = [
  'Select Your Location',
  'Choose Your Business',
  'Capital & Profile',
  'Review & Analyze',
];

const stepDescriptions = [
  'Search your village or pin on map to load local market data.',
  'Select a business category or describe your idea.',
  'Enter available capital and optional profile details.',
  'Review your inputs and run the feasibility analysis.',
];

export default function AssessmentWizardClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<WizardDraft>({ step: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  function goNext() {
    setDirection('forward');
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setDirection('backward');
    setCurrentStep((s) => Math.max(s - 1, 1));
  }
  function updateDraft(patch: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  const slideVariants = {
    enter: (dir: string) => ({
      x: dir === 'forward' ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({
      x: dir === 'forward' ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-teal-900 mb-2">Business Feasibility Assessment</h1>
        <p className="text-ink-muted">
          Complete all 4 steps to generate your evidence-backed feasibility report.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left: Step sidebar */}
        <div className="xl:col-span-1">
          <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} stepTitles={stepTitles} />
        </div>

        {/* Right: Step content */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-border shadow-gov-sm overflow-hidden">
            {/* Step header */}
            <div className="bg-paper-dark border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-900 text-primary-foreground flex items-center justify-center text-sm font-bold font-tabular">
                  {currentStep}
                </div>
                <div>
                  <h2 className="font-bold text-teal-900 text-lg">{stepTitles[currentStep - 1]}</h2>
                  <p className="text-ink-muted text-sm">{stepDescriptions[currentStep - 1]}</p>
                </div>
              </div>
            </div>

            {/* Animated step body */}
            <div className="relative min-h-[480px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={`wizard-step-${currentStep}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="absolute inset-0 p-6 overflow-y-auto"
                >
                  {currentStep === 1 && (
                    <StepLocation draft={draft} updateDraft={updateDraft} onNext={goNext} />
                  )}
                  {currentStep === 2 && (
                    <StepBusiness draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
                  )}
                  {currentStep === 3 && (
                    <StepCapital draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
                  )}
                  {currentStep === 4 && (
                    <StepReview draft={draft} onBack={goBack} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}