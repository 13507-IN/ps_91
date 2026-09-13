'use client';

import { Map, Compass, Wallet, LineChart, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function HowitWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Map,
      step: '01',
      title: t.howItWorks.steps.step1Title,
      desc: t.howItWorks.steps.step1Desc,
      color: '#1A3A6B',
    },
    {
      icon: Compass,
      step: '02',
      title: t.howItWorks.steps.step2Title,
      desc: t.howItWorks.steps.step2Desc,
      color: '#E65C00',
    },
    {
      icon: Wallet,
      step: '03',
      title: t.howItWorks.steps.step3Title,
      desc: t.howItWorks.steps.step3Desc,
      color: '#138808',
    },
    {
      icon: LineChart,
      step: '04',
      title: t.howItWorks.steps.step4Title,
      desc: t.howItWorks.steps.step4Desc,
      color: '#1A3A6B',
    },
    {
      icon: ShieldAlert,
      step: '05',
      title: t.howItWorks.steps.step5Title,
      desc: t.howItWorks.steps.step5Desc,
      color: '#E65C00',
    },
    {
      icon: ClipboardCheck,
      step: '06',
      title: t.howItWorks.steps.step6Title,
      desc: t.howItWorks.steps.step6Desc,
      color: '#138808',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#E65C00] mb-3 border-b-2 border-[#E65C00] pb-1">
            {t.howItWorks.sectionLabel}
          </div>
          <h2 className="text-3xl font-bold text-[#1A3A6B]">{t.howItWorks.headline}</h2>
          <p className="mt-3 text-[#4A5568]">
            {t.howItWorks.subheadline}
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, desc, color }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-[#DDDDDD] p-5 hover:shadow-md transition-shadow hover:border-[#E65C00]/40"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}14`, border: `1px solid ${color}25` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-3xl font-extrabold font-tabular leading-none pt-0.5" style={{ color: `${color}35` }}>
                  {step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#1A3A6B] mb-1.5">{title}</h3>
              <p className="text-sm leading-relaxed text-[#4A5568]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
