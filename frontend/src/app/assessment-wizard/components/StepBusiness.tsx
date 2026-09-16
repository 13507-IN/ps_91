'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import VoiceInput from '@/components/ui/VoiceInput';
import { CATEGORY_PHOTOS } from '@/lib/constants/landing-media';
import { Check, Sparkles } from 'lucide-react';
import { inr } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { autoClassifyCategory } from '@/lib/ai/classifyCategory';
import type { WizardDraft, BusinessCategory } from '@/types';

interface StepBusinessProps {
  draft: WizardDraft;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  { code: 'DAIRY' as BusinessCategory, name: 'Dairy', description: 'Milk, curd, ghee production & sales', range: [25000, 200000], subcategories: ['Cow Dairy', 'Buffalo Dairy', 'Milk Processing', 'Ghee/Paneer'] },
  { code: 'FOOD_PROCESSING' as BusinessCategory, name: 'Food Processing', description: 'Pickles, snacks, grain milling, masalas', range: [30000, 300000], subcategories: ['Pickle Making', 'Flour Mill', 'Rice Mill', 'Snack Unit'] },
  { code: 'RETAIL' as BusinessCategory, name: 'Retail Shop', description: 'General store, grocery, FMCG distribution', range: [20000, 150000], subcategories: ['General Store', 'Grocery', 'Kirana', 'Medical Shop'] },
  { code: 'TEXTILES_TAILORING' as BusinessCategory, name: 'Textiles & Tailoring', description: 'Stitching, embroidery, readymade garments', range: [15000, 100000], subcategories: ['Tailoring Unit', 'Embroidery', 'Saree Trading', 'Readymade Garments'] },
  { code: 'POULTRY' as BusinessCategory, name: 'Poultry', description: 'Broiler, layer, backyard poultry farming', range: [40000, 250000], subcategories: ['Broiler Farming', 'Layer Farming', 'Backyard Poultry', 'Egg Trading'] },
  { code: 'AGRICULTURE' as BusinessCategory, name: 'Agriculture', description: 'Crop cultivation, horticulture, organic farming', range: [20000, 500000], subcategories: ['Vegetable Farming', 'Floriculture', 'Organic Farming', 'Mushroom Cultivation'] },
  { code: 'LIVESTOCK' as BusinessCategory, name: 'Livestock', description: 'Goat, sheep, pig rearing and trading', range: [25000, 200000], subcategories: ['Goat Rearing', 'Sheep Rearing', 'Pig Farming', 'Animal Trading'] },
  { code: 'TRANSPORT' as BusinessCategory, name: 'Transport', description: 'E-rickshaw, mini-truck, taxi, logistics', range: [50000, 800000], subcategories: ['E-Rickshaw', 'Mini-Truck', 'Taxi/Cab', 'Tractor Hire'] },
  { code: 'HANDICRAFT' as BusinessCategory, name: 'Handicraft', description: 'Pottery, weaving, bamboo, terracotta', range: [10000, 80000], subcategories: ['Pottery', 'Bamboo Craft', 'Weaving', 'Terracotta'] },
  { code: 'SERVICES' as BusinessCategory, name: 'Services', description: 'Salon, mobile repair, recharge, CSC', range: [15000, 100000], subcategories: ['Salon/Beauty', 'Mobile Repair', 'CSC/e-Mitra', 'Photography'] },
  { code: 'OTHER' as BusinessCategory, name: 'Other', description: 'Describe your unique business idea', range: [10000, 500000], subcategories: [] },
];

export default function StepBusiness({ draft, updateDraft, onNext, onBack }: StepBusinessProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BusinessCategory | undefined>(draft.businessCategory);
  const [idea, setIdea] = useState(draft.businessIdea || '');
  const [manualOverride, setManualOverride] = useState(false);
  const [autoDetected, setAutoDetected] = useState<BusinessCategory | null>(null);

  // Auto classify on component mount if idea exists and category not selected
  useEffect(() => {
    if (idea && !selected) {
      const detected = autoClassifyCategory(idea);
      if (detected) {
        setAutoDetected(detected);
        setSelected(detected);
        updateDraft({ businessCategory: detected });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleIdeaChange(newIdea: string) {
    setIdea(newIdea);
    const detected = autoClassifyCategory(newIdea);

    if (detected) {
      setAutoDetected(detected);
      if (!manualOverride) {
        setSelected(detected);
        updateDraft({ businessIdea: newIdea, businessCategory: detected });
        return;
      }
    } else {
      setAutoDetected(null);
    }
    updateDraft({ businessIdea: newIdea });
  }

  function selectCategory(code: BusinessCategory) {
    setManualOverride(true);
    setSelected(code);
    updateDraft({ businessCategory: code });
  }

  const canContinue = !!selected;

  return (
    <div className="space-y-6">
      {/* Free-text idea */}
      <div>
        <label className="label-gov">{t.business.describeIdea}</label>
        <p className="text-xs text-ink-muted mb-2">{t.business.ideaHint}</p>

        {/* Voice Input Toolbar */}
        <VoiceInput
          currentValue={idea}
          onTranscript={handleIdeaChange}
        />

        <div className="relative mt-2">
          <textarea
            value={idea}
            onChange={(e) => handleIdeaChange(e.target.value)}
            placeholder={t.business.ideaPlaceholder}
            className="input-gov min-h-[120px] resize-none"
            rows={3}
          />
        </div>

        {/* Auto Category Banner */}
        {autoDetected && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs bg-teal-50 border border-teal-200 text-teal-950 rounded-xl px-3.5 py-2.5 shadow-xs">
            <Sparkles size={15} className="text-teal-700 flex-shrink-0" />
            <span>
              Auto-detected Category: <strong className="font-bold underline text-teal-900">{t.business.categories[autoDetected]}</strong>
            </span>
            <span className="ml-auto text-[11px] text-teal-700 font-medium">Click any category below if you want to change it</span>
          </div>
        )}
      </div>

      {/* Category grid */}
      <div>
        <label className="label-gov">{t.business.selectCategory}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={`cat-pick-${cat.code}`}
              type="button"
              onClick={() => selectCategory(cat.code)}
              className={`relative group rounded-xl border-2 overflow-hidden text-left transition-all duration-200 ${
                selected === cat.code
                  ? 'border-teal-900 shadow-gov-md ring-2 ring-teal-900/20'
                  : 'border-border hover:border-teal-400 hover:shadow-gov-sm'
              }`}
            >
              {/* Photo */}
              <div className="relative h-24 overflow-hidden">
                <AppImage
                  src={CATEGORY_PHOTOS[cat.code]}
                  alt={`${cat.name} category`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-400"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 to-transparent" />
                {selected === cat.code && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-saffron flex items-center justify-center">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-teal-900 text-xs mb-0.5">{t.business.categories[cat.code]}</div>
                <div className="text-ink-subtle text-xs font-tabular">
                  {inr(cat.range[0], true)}–{inr(cat.range[1], true)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected detail */}
      {selected && (
        <div className="bg-paper-dark border border-border rounded-xl p-4">
          <div className="font-semibold text-teal-900 mb-2">
            {t.business.categories[selected]}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.find(c => c.code === selected)?.subcategories.map((sub) => (
              <span key={`sub-${selected}-${sub}`} className="px-2.5 py-1 bg-white border border-border rounded-full text-xs text-ink-muted">
                {sub}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
        <button type="button" onClick={onBack} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg text-sm font-medium border border-border text-ink-muted hover:bg-paper-dark transition-colors">
          {t.common.back}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full sm:w-auto px-7 py-3 sm:py-2.5 rounded-lg text-sm font-semibold transition-all ${
            canContinue ? 'btn-saffron' : 'bg-muted text-ink-subtle cursor-not-allowed'
          }`}
        >
          {t.business.continueToCapital}
        </button>
      </div>
    </div>
  );
}