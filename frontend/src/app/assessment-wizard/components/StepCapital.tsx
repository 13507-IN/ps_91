'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IndianRupee, ChevronDown } from 'lucide-react';
import { inr } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { WizardDraft } from '@/types';

const schema = z.object({
  availableCapital: z.number({ message: 'Enter a valid amount' }).min(10000, 'Minimum ₹10,000').max(50000000, 'Maximum ₹5 Crore'),
  age: z.number().min(18).max(80).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  category: z.enum(['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY']).optional(),
  isMinority: z.boolean().optional(),
  businessExperience: z.string().optional(),
  availableLand: z.string().optional(),
  availableEquipment: z.string().optional(),
  expectedWorkingHours: z.number().min(1).max(16).optional(),
});

type FormValues = z.infer<typeof schema>;

const QUICK_CHIPS = [25000, 50000, 100000, 200000, 500000];

interface StepCapitalProps {
  draft: WizardDraft;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepCapital({ draft, updateDraft, onNext, onBack }: StepCapitalProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [capitalInput, setCapitalInput] = useState(draft.availableCapital ? String(draft.availableCapital) : '');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      availableCapital: draft.availableCapital,
      age: draft.age,
      gender: draft.gender,
      category: draft.category,
      isMinority: draft.isMinority,
      businessExperience: draft.businessExperience,
      availableLand: draft.availableLand,
      availableEquipment: draft.availableEquipment,
      expectedWorkingHours: draft.expectedWorkingHours,
    },
  });

  const capitalValue = watch('availableCapital');

  function selectChip(amount: number) {
    setValue('availableCapital', amount, { shouldValidate: true });
    setCapitalInput(String(amount));
    updateDraft({ availableCapital: amount });
  }

  function onSubmit(data: FormValues) {
    updateDraft(data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Capital input */}
      <div>
        <label className="label-gov">{t.capital.availableCapital}</label>
        <p className="text-xs text-ink-muted mb-3">{t.capital.capitalHint}</p>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_CHIPS.map((amount) => (
            <button
              key={`chip-${amount}`}
              type="button"
              onClick={() => selectChip(amount)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${capitalValue === amount
                ? 'bg-teal-900 text-white border-teal-900' : 'bg-white border-border text-ink-muted hover:border-teal-400 hover:text-teal-900'
                }`}
            >
              {inr(amount, true)}
            </button>
          ))}
        </div>

        <div className="relative">
          <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="number"
            value={capitalInput}
            onChange={(e) => {
              setCapitalInput(e.target.value);
              const num = Number(e.target.value);
              if (!isNaN(num)) {
                setValue('availableCapital', num, { shouldValidate: true });
                updateDraft({ availableCapital: num });
              }
            }}
            placeholder={t.capital.capitalPlaceholder}
            className="input-gov pl-9 font-tabular"
          />
        </div>
        {errors.availableCapital && (
          <p className="text-grade-poor text-xs mt-1">{errors.availableCapital.message}</p>
        )}
        {capitalValue >= 10000 && (
          <p className="text-flag-green text-xs mt-1 font-medium">
            ✓ {inr(capitalValue)} — eligible for scheme matching
          </p>
        )}
      </div>

      {/* Profile (optional) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-900 transition-colors"
        >
          <ChevronDown
            size={15}
            className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
          {t.capital.personalOptional}
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-paper-dark rounded-xl border border-border">
            {/* Age */}
            <div>
              <label className="label-gov">{t.common.age}</label>
              <input
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="e.g. 32"
                className="input-gov font-tabular"
                min={18} max={80}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="label-gov">{t.capital.gender}</label>
              <select {...register('gender')} className="input-gov">
                <option value="">{t.common.notSelected}</option>
                <option value="MALE">{t.capital.genderMale}</option>
                <option value="FEMALE">{t.capital.genderFemale}</option>
                <option value="OTHER">{t.capital.genderOther}</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="label-gov">{t.capital.socialCategory}</label>
              <select {...register('category')} className="input-gov">
                <option value="">{t.common.notSelected}</option>
                <option value="GENERAL">{t.capital.general}</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="MINORITY">{t.capital.minority}</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="label-gov">{t.capital.experience}</label>
              <input
                type="text"
                {...register('businessExperience')}
                placeholder={t.capital.expPlaceholder}
                className="input-gov"
              />
            </div>

            {/* Land */}
            <div>
              <label className="label-gov">{t.capital.land}</label>
              <input
                type="text"
                {...register('availableLand')}
                placeholder={t.capital.landPlaceholder}
                className="input-gov"
              />
            </div>

            {/* Equipment */}
            <div>
              <label className="label-gov">{t.capital.equipment}</label>
              <input
                type="text"
                {...register('availableEquipment')}
                placeholder={t.capital.equipPlaceholder}
                className="input-gov"
              />
            </div>

            {/* Working hours */}
            <div>
              <label className="label-gov">{t.capital.workingHours}</label>
              <input
                type="number"
                {...register('expectedWorkingHours', { valueAsNumber: true })}
                placeholder={t.capital.hoursPlaceholder}
                className="input-gov font-tabular"
                min={1} max={16}
              />
            </div>

            {/* Minority */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                {...register('isMinority')}
                id="isMinority"
                className="w-4 h-4 accent-teal-900"
              />
              <label htmlFor="isMinority" className="text-sm text-ink-muted cursor-pointer">
                {t.capital.isMinority}
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
        <button type="button" onClick={onBack} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium border border-border text-ink-muted hover:bg-paper-dark transition-colors">
          {t.common.back}
        </button>
        <button
          type="submit"
          className="btn-saffron w-full sm:w-auto px-7 py-3 sm:py-2.5 rounded-lg text-sm font-semibold"
        >
          {t.capital.continueToReview}
        </button>
      </div>
    </form>
  );
}