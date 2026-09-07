import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalyzeFeasibilityBody } from '@/types';

export type WizardDraft = Partial<AnalyzeFeasibilityBody> & {
  villageName?: string;
  block?: string;
  district?: string;
  state?: string;
};

interface WizardState {
  step: number;
  draft: WizardDraft;
  setStep: (step: number) => void;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      step: 0,
      draft: {
        catchmentRadiusKm: 10,
      },
      setStep: (step) => set({ step }),
      updateDraft: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ step: 0, draft: { catchmentRadiusKm: 10 } }),
    }),
    {
      name: 'udyamsetu-wizard-draft',
    },
  ),
);