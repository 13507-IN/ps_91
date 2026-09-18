'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import VoiceInput from '@/components/ui/VoiceInput';
import { CATEGORY_PHOTOS } from '@/lib/constants/landing-media';
import { Check, Sparkles, Banknote, Tag, Layers, Mic, Volume2 } from 'lucide-react';
import { inr } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { extractVoiceIntent, type ExtractedVoiceIntent } from '@/lib/ai/voiceIntentExtractor';
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
  const { t, lang } = useTranslation();
  const [selected, setSelected] = useState<BusinessCategory | undefined>(draft.businessCategory);
  const [idea, setIdea] = useState(draft.businessIdea || '');
  const [manualOverride, setManualOverride] = useState(false);
  const [voiceIntent, setVoiceIntent] = useState<ExtractedVoiceIntent | null>(null);

  // Auto classify on component mount if idea exists
  useEffect(() => {
    if (idea) {
      const intent = extractVoiceIntent(idea);
      setVoiceIntent(intent);
      if (intent.category && !selected) {
        setSelected(intent.category);
        updateDraft({
          businessCategory: intent.category,
          ...(intent.capital ? { availableCapital: intent.capital } : {}),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleIdeaChange(newIdea: string) {
    setIdea(newIdea);
    const intent = extractVoiceIntent(newIdea);
    setVoiceIntent(intent);

    const patch: Partial<WizardDraft> = { businessIdea: newIdea };

    if (intent.category && !manualOverride) {
      setSelected(intent.category);
      patch.businessCategory = intent.category;
    }

    if (intent.capital && (!draft.availableCapital || draft.availableCapital === 50000)) {
      patch.availableCapital = intent.capital;
    }

    if (intent.scale && !draft.businessExperience) {
      patch.businessExperience = intent.scale;
    }

    updateDraft(patch);
  }

  function selectCategory(code: BusinessCategory) {
    setManualOverride(true);
    setSelected(code);
    updateDraft({ businessCategory: code });
  }

  const canContinue = !!selected;

  return (
    <div className="space-y-6">
      {/* Zero-Typing Voice Intake Hero */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E65C00] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Mic className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'BN'
                  ? 'কথা বলে শুরু করুন (Zero-Typing Voice Intake)'
                  : lang === 'HI'
                    ? 'बोलकर शुरू करें (Zero-Typing Voice Intake)'
                    : 'Zero-Typing Voice Intake'}
              </h3>
              <p className="text-xs text-slate-600">
                {lang === 'BN'
                  ? 'টাইপ করার দরকার নেই—মাইক্রোফোনে আপনার ব্যবসার ইচ্ছে ও জমানো টাকার কথা বলুন।'
                  : lang === 'HI'
                    ? 'टाइप करने की जरूरत नहीं—माइक दबाकर अपने व्यवसाय और पूंजी के बारे में बोलें।'
                    : 'Speak naturally in your own language—ArthSetu auto-extracts business type, capital & scale.'}
              </p>
            </div>
          </div>
        </div>

        {/* Example prompts */}
        <div className="mb-3 rounded-xl bg-white/80 border border-amber-200 p-3 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Volume2 className="h-3.5 w-3.5 text-[#E65C00]" />
            <span>{lang === 'BN' ? 'যেমন বলতে পারেন:' : lang === 'HI' ? 'उदाहरण के लिए ऐसे बोलें:' : 'Example Spoken Prompts:'}</span>
          </div>
          <p className="italic text-slate-600 pl-5">
            {lang === 'BN'
              ? '🗣️ "আমি ৩টে গরু নিয়ে দুধের ব্যবসা করতে চাই, আমার কাছে ৫০ হাজার টাকা আছে"'
              : lang === 'HI'
                ? '🗣️ "मुझे गांव में किराने की दुकान खोलनी है, मेरे पास 40 हजार रुपये हैं"'
                : '🗣️ "I want to start a 3-cow dairy farm with 50,000 rupees capital in Nadia"'}
          </p>
        </div>

        {/* Voice Input Toolbar */}
        <VoiceInput
          currentValue={idea}
          onTranscript={handleIdeaChange}
        />

        <div className="relative mt-2">
          <textarea
            value={idea}
            onChange={(e) => handleIdeaChange(e.target.value)}
            placeholder={
              lang === 'BN'
                ? 'মাইক্রোফোনে বলুন অথবা এখানে ব্যবসার বিবরণ লিখুন...'
                : lang === 'HI'
                  ? 'माइक से बोलें या यहाँ अपने व्यापार का विवरण लिखें...'
                  : t.business.ideaPlaceholder
            }
            className="input-gov min-h-[100px] resize-none bg-white font-medium"
            rows={3}
          />
        </div>

        {/* Real-time Extracted Blueprint Card */}
        {voiceIntent && voiceIntent.isComplete && (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>
                {lang === 'BN'
                  ? 'আপনার কণ্ঠস্বর থেকে শনাক্তকৃত তথ্য (Auto-Extracted Blueprint):'
                  : lang === 'HI'
                    ? 'आपकी आवाज से स्वतः निकाली गई जानकारी:'
                    : 'Auto-Extracted Business Blueprint from Voice:'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {voiceIntent.category && (
                <div className="rounded-lg bg-white p-2 border border-emerald-200 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">{lang === 'BN' ? 'ব্যবসার ধরণ' : lang === 'HI' ? 'व्यवसाय प्रकार' : 'Category'}</span>
                    <strong className="font-bold text-slate-900">{t.business.categories[voiceIntent.category]}</strong>
                  </div>
                </div>
              )}

              {voiceIntent.capital && (
                <div className="rounded-lg bg-white p-2 border border-emerald-200 flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">{lang === 'BN' ? 'জমা পুঁজি' : lang === 'HI' ? 'अपनी पूंजी' : 'Available Capital'}</span>
                    <strong className="font-bold text-emerald-700">{voiceIntent.capitalFormatted}</strong>
                  </div>
                </div>
              )}

              {voiceIntent.scale && (
                <div className="rounded-lg bg-white p-2 border border-emerald-200 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">{lang === 'BN' ? 'কাজের পরিধি' : lang === 'HI' ? 'कार्य पैमाना' : 'Scale'}</span>
                    <strong className="font-bold text-slate-900">{voiceIntent.scale}</strong>
                  </div>
                </div>
              )}
            </div>
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