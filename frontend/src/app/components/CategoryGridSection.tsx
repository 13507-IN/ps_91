'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { inr } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { CATEGORY_PHOTOS } from '@/lib/constants/landing-media';
import {
  Milk, UtensilsCrossed, ShoppingBag, Scissors, Bird,
  Wheat, Beef, Truck, Paintbrush, Briefcase, Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function CategoryGridSection() {
  const { t, lang } = useTranslation();

  const categories = [
    {
      code: 'DAIRY',
      name: t.categories.items.DAIRY.name,
      description: t.categories.items.DAIRY.desc,
      range: [25000, 200000],
      icon: Milk,
      iconBg: 'bg-sky-500/90 text-white',
      badgeLabel: lang === 'BN' ? 'দুধ ও পনির' : lang === 'HI' ? 'दूध व पनीर' : 'Milk & Paneer',
    },
    {
      code: 'FOOD_PROCESSING',
      name: t.categories.items.FOOD_PROCESSING.name,
      description: t.categories.items.FOOD_PROCESSING.desc,
      range: [30000, 300000],
      icon: UtensilsCrossed,
      iconBg: 'bg-orange-500/90 text-white',
      badgeLabel: lang === 'BN' ? 'তেল ও মশলা মিল' : lang === 'HI' ? 'तेल व मसाला मिल' : 'Oil & Spices',
    },
    {
      code: 'RETAIL',
      name: t.categories.items.RETAIL.name,
      description: t.categories.items.RETAIL.desc,
      range: [20000, 150000],
      icon: ShoppingBag,
      iconBg: 'bg-emerald-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'মুদি ও জেনারেল স্টোর' : lang === 'HI' ? 'किराना दुकान' : 'Kirana & FMCG',
    },
    {
      code: 'TEXTILES_TAILORING',
      name: t.categories.items.TEXTILES_TAILORING.name,
      description: t.categories.items.TEXTILES_TAILORING.desc,
      range: [15000, 100000],
      icon: Scissors,
      iconBg: 'bg-rose-500/90 text-white',
      badgeLabel: lang === 'BN' ? 'দর্জি ও সেলাই' : lang === 'HI' ? 'सिलाई व बुटीक' : 'Tailoring Unit',
    },
    {
      code: 'POULTRY',
      name: t.categories.items.POULTRY.name,
      description: t.categories.items.POULTRY.desc,
      range: [40000, 250000],
      icon: Bird,
      iconBg: 'bg-amber-500/90 text-white',
      badgeLabel: lang === 'BN' ? 'ব্রয়লার ও ডিম' : lang === 'HI' ? 'मुर्गी व अंडा' : 'Broiler & Eggs',
    },
    {
      code: 'AGRICULTURE',
      name: t.categories.items.AGRICULTURE.name,
      description: t.categories.items.AGRICULTURE.desc,
      range: [20000, 500000],
      icon: Wheat,
      iconBg: 'bg-green-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'সবজি ও ফসল' : lang === 'HI' ? 'सब्जी व खेती' : 'Crops & Farming',
    },
    {
      code: 'LIVESTOCK',
      name: t.categories.items.LIVESTOCK.name,
      description: t.categories.items.LIVESTOCK.desc,
      range: [25000, 200000],
      icon: Beef,
      iconBg: 'bg-stone-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'ছাগল ও ভেড়া পালন' : lang === 'HI' ? 'बकरी पालन' : 'Goat Rearing',
    },
    {
      code: 'TRANSPORT',
      name: t.categories.items.TRANSPORT.name,
      description: t.categories.items.TRANSPORT.desc,
      range: [50000, 800000],
      icon: Truck,
      iconBg: 'bg-blue-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'টোটো / পরিবহন' : lang === 'HI' ? 'ई-रिक्शा / वाहन' : 'E-Rickshaw / Logistics',
    },
    {
      code: 'HANDICRAFT',
      name: t.categories.items.HANDICRAFT.name,
      description: t.categories.items.HANDICRAFT.desc,
      range: [10000, 80000],
      icon: Paintbrush,
      iconBg: 'bg-purple-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'হস্তশিল্প ও মাটির কাজ' : lang === 'HI' ? 'हस्तशिल्प व मिट्टी' : 'Artisan Crafts',
    },
    {
      code: 'SERVICES',
      name: t.categories.items.SERVICES.name,
      description: t.categories.items.SERVICES.desc,
      range: [15000, 100000],
      icon: Briefcase,
      iconBg: 'bg-cyan-600/90 text-white',
      badgeLabel: lang === 'BN' ? 'রিপেয়ার ও সিএসসি' : lang === 'HI' ? 'रिपेयर व सीएससी' : 'Repair & CSC',
    },
    {
      code: 'OTHER',
      name: t.categories.items.OTHER.name,
      description: t.categories.items.OTHER.desc,
      range: [10000, 500000],
      icon: Lightbulb,
      iconBg: 'bg-slate-700/90 text-white',
      badgeLabel: lang === 'BN' ? 'অন্যান্য ব্যবসা' : lang === 'HI' ? 'अन्य व्यवसाय' : 'Other Ideas',
    },
  ];

  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="mb-12">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E65C00] mb-3 border-b-2 border-[#E65C00] pb-1">
            {t.categories.sectionLabel}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1A3A6B] mb-4">
            {t.categories.headline}
          </h2>
          <p className="text-[#4A5568] text-lg max-w-xl">
            {t.categories.subheadline}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const photoSrc = CATEGORY_PHOTOS[cat.code] || '/assets/categories/other.jpg';

            return (
              <Link
                key={`cat-${cat.code}`}
                href={`/assessment-wizard?category=${cat.code}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E65C00] flex flex-col justify-between"
              >
                {/* Photo Banner with real photograph */}
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
                  <AppImage
                    src={photoSrc}
                    alt={`${cat.name} photo`}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    unoptimized
                  />

                  {/* Gradient Overlay for text & badge legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />

                  {/* Category icon badge on top left */}
                  <div className={`absolute top-2.5 left-2.5 rounded-xl ${cat.iconBg} backdrop-blur-xs p-1.5 shadow-md`}>
                    <Icon size={16} aria-hidden="true" />
                  </div>

                  {/* Localized badge on top right */}
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-black/50 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/20">
                    {cat.badgeLabel}
                  </div>

                  {/* Investment Range Pill on bottom right */}
                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-[#E65C00] text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                    {inr(cat.range[0], true)} – {inr(cat.range[1], true)}
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-3.5 sm:p-4 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#1A3A6B] text-sm sm:text-base mb-1 group-hover:text-[#E65C00] transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[#4A5568] text-xs leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#E65C00] group-hover:translate-x-0.5 transition-transform">
                    <span>
                      {lang === 'BN' ? 'যাচাই করুন' : lang === 'HI' ? 'जांचें' : 'Check Viability'}
                    </span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}