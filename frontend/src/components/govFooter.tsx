'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function GovFooter() {
  const { t, lang, setLang } = useTranslation();
  return (
    <footer className="bg-[#1A3A6B] text-white mt-0" role="contentinfo">
      {/* Tricolor top bar */}
      <div className="tricolor-divider w-full" aria-hidden="true" />

      {/* Main footer grid */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* Mini emblem */}
              <div className="w-12 h-12 rounded-full border-2 border-[#FF9933] flex items-center justify-center bg-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="UdyamSetu AI Logo" className="w-9 h-9 rounded-full object-contain" />
              </div>
              <div>
                <div className="text-[#FF9933] text-xs font-bold uppercase tracking-widest">
                  ArthSetu
                </div>
                <div className="text-white font-bold text-lg leading-tight">{t.common.appName}</div>
              </div>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-3">
              {t.footer.description}
            </p>
            <p className="text-xs text-white/45">
              {t.footer.govLine}
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-b border-white/15 pb-2">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: t.nav.home },
                { href: '/assessment-wizard', label: t.footer.startAssessment },
                { href: '/schemes', label: t.nav.schemes },
                { href: '/feasibility-report', label: t.footer.sampleReport },
                { href: '/dashboard', label: t.nav.dashboard },
                { href: '/settings', label: t.footer.profileSettings },
                { href: '/admin', label: t.nav.admin },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 hover:text-[#FF9933] transition-colors"
                  >
                    › {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Data Sources */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-b border-white/15 pb-2">
              {t.footer.dataSources}
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                t.footer.census,
                t.footer.udyam,
                t.footer.agmarknet,
                t.footer.livestock,
                t.footer.pmgsy,
                'LGD Location Database',
                'Crop Cultivation Statistics',
              ].map((s) => (
                <li key={s} className="flex items-start gap-1.5">
                  <span className="text-[#FF9933] mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal + Language */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-b border-white/15 pb-2">
              {t.footer.legal}
            </h3>
            <ul className="space-y-2 text-sm mb-6">
              {[
                t.footer.privacy,
                t.footer.terms,
                t.footer.disclaimer,
                t.footer.accessibility,
                t.footer.contact,
              ].map((l) => (
                <li key={l}>
                  <a href="#" className="text-white/60 hover:text-[#FF9933] transition-colors">
                    › {l}
                  </a>
                </li>
              ))}
            </ul>

            {/* Language selector */}
            <div className="pt-4 border-t border-white/15">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Language / ভাষা</p>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setLang('EN')}
                  className={`px-3 py-1.5 rounded border font-semibold transition-colors ${lang === 'EN' ? 'border-[#FF9933] text-[#FF9933] bg-[#FF9933]/10' : 'border-white/30 text-white/60 hover:border-[#FF9933] hover:text-[#FF9933]'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('BN')}
                  className={`px-3 py-1.5 rounded border font-semibold transition-colors ${lang === 'BN' ? 'border-[#FF9933] text-[#FF9933] bg-[#FF9933]/10' : 'border-white/30 text-white/60 hover:border-[#FF9933] hover:text-[#FF9933]'}`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme partner logos bar */}
        <div className="border-t border-white/15 border-b border-white/15 py-6 mb-8">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-4">Scheme Partners</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'PMEGP', sub: 'Prime Minister Employment Generation Programme' },
              { label: 'MUDRA', sub: 'Micro Units Development Refinance Agency' },
              { label: 'Stand-Up India', sub: 'SC/ST & Women Entrepreneurs' },
              { label: 'PMFME', sub: 'Formalisation of Micro Food Enterprises' },
              { label: 'UDYAM', sub: 'MSME Registration Portal' },
            ].map((scheme) => (
              <div
                key={scheme.label}
                className="px-4 py-2.5 rounded border border-white/20 bg-white/5 hover:border-[#FF9933]/50 transition-colors"
                title={scheme.sub}
              >
                <div className="text-xs font-bold text-white">{scheme.label}</div>
                <div className="text-[10px] text-white/45 max-w-[120px] leading-tight mt-0.5 hidden sm:block">
                  {scheme.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer + copyright */}
        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
          <p className="text-xs text-white/45 leading-relaxed max-w-3xl">
            <strong className="text-white/60">{t.footer.disclaimer}:</strong> This is an independent platform
            and not an official Government of India website. All feasibility assessments are advisory
            in nature and should be validated with local authorities, financial institutions, and
            qualified advisors before making investment decisions.
          </p>
          <p className="text-xs text-white/35 whitespace-nowrap">
            © 2026 ArthSetu · v2.0
          </p>
        </div>
      </div>

      {/* Tricolor bottom strip */}
      <div className="tricolor-divider w-full" aria-hidden="true" />
    </footer>
  );
}
