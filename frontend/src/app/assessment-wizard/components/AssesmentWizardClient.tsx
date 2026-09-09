'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './WizardProgress';
import StepLocation from './StepLocation';
import StepBusiness from './StepBusiness';
import StepCapital from './StepCapital';
import StepReview from './StepReview';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuthStore } from '@/lib/store/auth';
import type { WizardDraft } from '@/types';

export { LAST_REPORT_KEY } from '@/lib/constants';
const TOTAL_STEPS = 4;

export default function AssessmentWizardClient() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  // Compute age from dateOfBirth if available
  const initialDraft = useMemo<WizardDraft>(() => {
    const base: WizardDraft = { step: 1 };
    if (!user) return base;

    // Auto-fill age from date of birth
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age >= 18 && age <= 80) base.age = age;
    }

    // Auto-fill gender
    if (user.gender) base.gender = user.gender;

    // Auto-fill social category
    if (user.category) base.category = user.category;

    // Auto-fill minority status
    if (user.isMinority !== undefined) base.isMinority = user.isMinority;

    return base;
  }, [user]);

  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-teal-900 mb-2">{t.wizard.pageTitle}</h1>
        <p className="text-ink-muted">
          {t.wizard.pageDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
        {/* Left: Step sidebar */}
        <div className="xl:col-span-1">
          <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} stepTitles={t.wizard.stepTitles} />
        </div>

        {/* Right: Step content */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-border shadow-gov-sm overflow-hidden">
            {/* Step header */}
            <div className="bg-paper-dark border-b border-border px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-900 text-primary-foreground flex items-center justify-center text-sm font-bold font-tabular">
                  {currentStep}
                </div>
                <div>
                  <h2 className="font-bold text-teal-900 text-lg">{t.wizard.stepTitles[currentStep - 1]}</h2>
                  <p className="text-ink-muted text-sm">{t.wizard.stepDescriptions[currentStep - 1]}</p>
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
                  className="absolute inset-0 p-4 sm:p-6 overflow-y-auto"
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