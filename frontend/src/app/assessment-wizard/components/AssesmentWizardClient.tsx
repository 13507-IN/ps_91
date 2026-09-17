'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './WizardProgress';
import StepLocation from './StepLocation';
import StepBusiness from './StepBusiness';
import StepCapital from './StepCapital';
import StepReview from './StepReview';
import { VoiceWizard } from './VoiceWizard';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuthStore } from '@/lib/store/auth';
import { getDraftOffline, saveDraftOffline } from '@/lib/offline/offlineStore';
import { Mic, FileText } from 'lucide-react';
import { hasSession, api, apiEndpoints } from '@/lib/api/client';
import type { WizardDraft, UserProfile } from '@/types';

export { LAST_REPORT_KEY } from '@/lib/constants';
const TOTAL_STEPS = 4;

export default function AssessmentWizardClient() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  // Compute initial draft prefilled from user profile
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

    if (user.gender) base.gender = user.gender;
    if (user.category) base.category = user.category;
    if (user.isMinority !== undefined) base.isMinority = user.isMinority;
    if (user.businessExperience) base.businessExperience = user.businessExperience;
    if (user.availableLand) base.availableLand = user.availableLand;
    if (user.availableEquipment) base.availableEquipment = user.availableEquipment;
    if (user.expectedWorkingHours) base.expectedWorkingHours = user.expectedWorkingHours;
    if (user.preferredCategory) base.businessCategory = user.preferredCategory;
    if (user.catchmentRadiusKm) base.catchmentRadiusKm = user.catchmentRadiusKm;

    if (user.location) {
      if (user.location.village) base.villageName = user.location.village;
      if (user.location.block) base.block = user.location.block;
      if (user.location.district) base.district = user.location.district;
      if (user.location.state) base.state = user.location.state;
      if (user.location.latitude) base.latitude = user.location.latitude;
      if (user.location.longitude) base.longitude = user.location.longitude;
    }

    return base;
  }, [user]);

  const [mode, setMode] = useState<'form' | 'voice'>('form');
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Restore saved offline draft on mount if available
  React.useEffect(() => {
    getDraftOffline().then((saved) => {
      if (saved) {
        setDraft((prev) => {
          const merged = { ...prev, ...saved };
          if (!merged.gender && user?.gender) merged.gender = user.gender;
          if (!merged.category && user?.category) merged.category = user.category;
          if (!merged.age && user?.dateOfBirth) {
            const dob = new Date(user.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
              age--;
            }
            if (age >= 18 && age <= 80) merged.age = age;
          }
          if (merged.isMinority === undefined && user?.isMinority !== undefined) {
            merged.isMinority = user.isMinority;
          }
          if (!merged.businessExperience && user?.businessExperience) merged.businessExperience = user.businessExperience;
          if (!merged.availableLand && user?.availableLand) merged.availableLand = user.availableLand;
          if (!merged.availableEquipment && user?.availableEquipment) merged.availableEquipment = user.availableEquipment;
          if (!merged.expectedWorkingHours && user?.expectedWorkingHours) merged.expectedWorkingHours = user.expectedWorkingHours;
          if (!merged.businessCategory && user?.preferredCategory) merged.businessCategory = user.preferredCategory;
          if (!merged.catchmentRadiusKm && user?.catchmentRadiusKm) merged.catchmentRadiusKm = user.catchmentRadiusKm;

          if (user?.location) {
            if (!merged.villageName && user.location.village) merged.villageName = user.location.village;
            if (!merged.block && user.location.block) merged.block = user.location.block;
            if (!merged.district && user.location.district) merged.district = user.location.district;
            if (!merged.state && user.location.state) merged.state = user.location.state;
            if (!merged.latitude && user.location.latitude) merged.latitude = user.location.latitude;
            if (!merged.longitude && user.location.longitude) merged.longitude = user.location.longitude;
          }
          return merged;
        });
        if (saved.step && saved.step > 1) {
          setCurrentStep(saved.step);
        }
      }
    }).catch(() => {});
  }, [user]);

  // Fetch latest user profile from API on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasSession()) {
      api<UserProfile>(apiEndpoints.users.me)
        .then((profile) => {
          if (profile) {
            useAuthStore.getState().setUser(profile);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Dynamic user profile sync into draft
  React.useEffect(() => {
    if (!user) return;
    setDraft((prev) => {
      const patch: Partial<WizardDraft> = {};
      if (user.dateOfBirth) {
        const dob = new Date(user.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age >= 18 && age <= 80 && !prev.age) patch.age = age;
      }
      if (user.gender && !prev.gender) patch.gender = user.gender;
      if (user.category && !prev.category) patch.category = user.category;
      if (user.isMinority !== undefined && prev.isMinority === undefined) patch.isMinority = user.isMinority;
      if (user.businessExperience && !prev.businessExperience) patch.businessExperience = user.businessExperience;
      if (user.availableLand && !prev.availableLand) patch.availableLand = user.availableLand;
      if (user.availableEquipment && !prev.availableEquipment) patch.availableEquipment = user.availableEquipment;
      if (user.expectedWorkingHours && !prev.expectedWorkingHours) patch.expectedWorkingHours = user.expectedWorkingHours;
      if (user.preferredCategory && !prev.businessCategory) patch.businessCategory = user.preferredCategory;
      if (user.catchmentRadiusKm && !prev.catchmentRadiusKm) patch.catchmentRadiusKm = user.catchmentRadiusKm;

      if (user.location) {
        if (!prev.villageName && user.location.village) patch.villageName = user.location.village;
        if (!prev.block && user.location.block) patch.block = user.location.block;
        if (!prev.district && user.location.district) patch.district = user.location.district;
        if (!prev.state && user.location.state) patch.state = user.location.state;
        if (!prev.latitude && user.location.latitude) patch.latitude = user.location.latitude;
        if (!prev.longitude && user.location.longitude) patch.longitude = user.location.longitude;
      }

      if (Object.keys(patch).length > 0) {
        return { ...prev, ...patch };
      }
      return prev;
    });
  }, [user]);

  function goNext() {
    setDirection('forward');
    setCurrentStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS);
      saveDraftOffline({ ...draft, step: next }).catch(() => {});
      return next;
    });
  }
  function goBack() {
    setDirection('backward');
    setCurrentStep((s) => {
      const prev = Math.max(s - 1, 1);
      saveDraftOffline({ ...draft, step: prev }).catch(() => {});
      return prev;
    });
  }
  function updateDraft(patch: Partial<WizardDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      saveDraftOffline(next).catch(() => {});
      return next;
    });
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
      {/* Header with Mode Toggle */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-teal-900 mb-1">{t.wizard.pageTitle}</h1>
          <p className="text-ink-muted text-sm">
            {t.wizard.pageDescription}
          </p>
        </div>

        {/* Form Mode vs Voice Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'form'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            Form Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'voice'
                ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic size={14} />
            Voice Mode
          </button>
        </div>
      </div>

      {mode === 'voice' ? (
        <VoiceWizard
          draft={draft}
          updateDraft={updateDraft}
          onSwitchToForm={() => setMode('form')}
          onComplete={() => {
            setMode('form');
            setCurrentStep(4);
          }}
        />
      ) : (
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
      )}
    </div>
  );
}