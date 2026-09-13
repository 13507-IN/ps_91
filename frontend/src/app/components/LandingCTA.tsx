'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function LandingCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        <div
          className="rounded-2xl px-6 py-14 text-center text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #102347 0%, #1A3A6B 50%, #1E4A8A 100%)',
          }}
        >
          {/* Tricolor top accent */}
          <div className="tricolor-divider absolute top-0 left-0 right-0" aria-hidden="true" />

          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
            aria-hidden="true"
          />

          {/* Decorative orange arcs */}
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ backgroundColor: '#E65C00' }}
            aria-hidden="true"
          />
          <div
            className="absolute -left-16 -bottom-16 w-60 h-60 rounded-full opacity-10 pointer-events-none"
            style={{ backgroundColor: '#FF9933' }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FF9933] mb-4 border-b-2 border-[#FF9933] pb-1">
              {t.cta.sectionLabel}
            </div>
            <h2 className="text-3xl font-bold text-white">{t.cta.headline}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75 text-base">
              {t.cta.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/assessment-wizard"
                className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded text-white bg-[#E65C00] hover:bg-[#CC5200] transition-colors"
              >
                {t.cta.primaryBtn}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/feasibility-report"
                className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                {t.cta.secondaryBtn}
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/45">
              {t.cta.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
