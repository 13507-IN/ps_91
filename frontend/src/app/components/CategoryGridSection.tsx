import React from 'react';
import Link from 'next/link';
import { inr } from '@/lib/format';
import {
  Milk, UtensilsCrossed, ShoppingBag, Scissors, Bird,
  Wheat, Beef, Truck, Paintbrush, Briefcase, Lightbulb,
} from 'lucide-react';

const categories = [
  {
    code: 'DAIRY', name: 'Dairy',
    description: 'Milk production, processing & sales',
    range: [25000, 200000],
    icon: Milk,
    bg: 'from-sky-100 to-sky-200',
    iconColor: 'text-sky-700',
  },
  {
    code: 'FOOD_PROCESSING', name: 'Food Processing',
    description: 'Pickles, snacks, grain milling',
    range: [30000, 300000],
    icon: UtensilsCrossed,
    bg: 'from-amber-100 to-orange-200',
    iconColor: 'text-orange-700',
  },
  {
    code: 'RETAIL', name: 'Retail Shop',
    description: 'General store, grocery, FMCG',
    range: [20000, 150000],
    icon: ShoppingBag,
    bg: 'from-emerald-100 to-teal-200',
    iconColor: 'text-teal-700',
  },
  {
    code: 'TEXTILES_TAILORING', name: 'Textiles & Tailoring',
    description: 'Stitching, embroidery, readymade',
    range: [15000, 100000],
    icon: Scissors,
    bg: 'from-pink-100 to-rose-200',
    iconColor: 'text-rose-700',
  },
  {
    code: 'POULTRY', name: 'Poultry',
    description: 'Broiler, layer, backyard poultry',
    range: [40000, 250000],
    icon: Bird,
    bg: 'from-yellow-100 to-amber-200',
    iconColor: 'text-amber-700',
  },
  {
    code: 'AGRICULTURE', name: 'Agriculture',
    description: 'Crop cultivation, horticulture',
    range: [20000, 500000],
    icon: Wheat,
    bg: 'from-lime-100 to-green-200',
    iconColor: 'text-green-700',
  },
  {
    code: 'LIVESTOCK', name: 'Livestock',
    description: 'Goat, sheep, pig rearing',
    range: [25000, 200000],
    icon: Beef,
    bg: 'from-stone-100 to-stone-200',
    iconColor: 'text-stone-700',
  },
  {
    code: 'TRANSPORT', name: 'Transport',
    description: 'E-rickshaw, mini-truck, taxi',
    range: [50000, 800000],
    icon: Truck,
    bg: 'from-blue-100 to-indigo-200',
    iconColor: 'text-indigo-700',
  },
  {
    code: 'HANDICRAFT', name: 'Handicraft',
    description: 'Pottery, weaving, bamboo craft',
    range: [10000, 80000],
    icon: Paintbrush,
    bg: 'from-purple-100 to-violet-200',
    iconColor: 'text-violet-700',
  },
  {
    code: 'SERVICES', name: 'Services',
    description: 'Salon, repair, mobile recharge',
    range: [15000, 100000],
    icon: Briefcase,
    bg: 'from-cyan-100 to-cyan-200',
    iconColor: 'text-cyan-700',
  },
  {
    code: 'OTHER', name: 'Other',
    description: 'Describe your unique idea',
    range: [10000, 500000],
    icon: Lightbulb,
    bg: 'from-slate-100 to-slate-200',
    iconColor: 'text-slate-600',
  },
];

export default function CategoryGridSection() {
  return (
    <section className="py-20 bg-paper-dark">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-teal-900 mb-4">
            11 Business Categories Covered
          </h2>
          <p className="text-ink-muted text-lg max-w-xl">
            From dairy farming to transport services — each category loaded with local investment
            benchmarks, scheme eligibility, and demand estimates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={`cat-${cat.code}`}
                href={`/assessment-wizard?category=${cat.code}`}
                className="group bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#146C64]"
              >
                {/* Illustration placeholder */}
                <div className={`relative h-28 bg-gradient-to-br ${cat.bg} flex items-center justify-center overflow-hidden`}>
                  <Icon
                    size={48}
                    className={`${cat.iconColor} opacity-60 group-hover:opacity-85 transition-opacity group-hover:scale-110 transition-transform duration-300`}
                    aria-hidden="true"
                  />
                  {/* Subtle corner accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0B3D3A]/15 to-transparent" />
                </div>

                <div className="p-3">
                  <div className="font-bold text-teal-900 text-sm mb-0.5">{cat.name}</div>
                  <div className="text-ink-subtle text-xs mb-2 leading-snug">{cat.description}</div>
                  <div className="text-xs text-teal-600 font-semibold font-tabular">
                    {inr(cat.range[0], true)} – {inr(cat.range[1], true)}
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