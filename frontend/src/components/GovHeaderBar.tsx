'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, LayoutDashboard, Settings, ShieldCheck, ChevronDown } from 'lucide-react';

type Lang = 'EN' | 'BN';

const NAV_LABELS: Record<Lang, Record<string, string>> = {
  EN: {
    home: 'Home',
    assess: 'Start Assessment',
    schemes: 'Schemes',
    sampleReport: 'Sample Report',
    dashboard: 'Dashboard',
    admin: 'Admin',
    settings: 'Settings',
    freeAssessment: 'Free Assessment',
    tagline: 'Local Business Intelligence',
    language: 'বাংলা',
  },
  BN: {
    home: 'হোম',
    assess: 'মূল্যায়ন শুরু করুন',
    schemes: 'প্রকল্পসমূহ',
    sampleReport: 'নমুনা রিপোর্ট',
    dashboard: 'ড্যাশবোর্ড',
    admin: 'অ্যাডমিন',
    settings: 'সেটিংস',
    freeAssessment: 'বিনামূল্যে মূল্যায়ন',
    tagline: 'স্থানীয় ব্যবসায়িক তথ্য',
    language: 'English',
  },
};

export default function GovHeaderBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const pathname = usePathname();
  const t = NAV_LABELS[lang];

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/assessment-wizard', label: t.assess },
    { href: '/schemes', label: t.schemes },
    { href: '/feasibility-report', label: t.sampleReport },
    { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/settings', label: t.settings, icon: Settings },
    { href: '/admin', label: t.admin, icon: ShieldCheck },
  ];

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">
      {/* ── Top utility bar ── */}
      <div className="gov-topbar bg-[#0B3D3A] text-[#FAF8F3] text-xs py-1.5 px-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:text-[#E98A15] underline mr-4"
          >
            Skip to main content
          </a>
          <span className="text-[#FAF8F3]/70 hidden sm:block tracking-wide">
            भारत सरकार &nbsp;·&nbsp; Government of India &nbsp;·&nbsp; Data-Backed · Official Sources
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="flex items-center gap-1.5 text-[#FAF8F3]/80 hover:text-[#E98A15] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E98A15]"
              aria-label="Toggle language"
            >
              <Globe size={13} />
              <span className="font-medium">{t.language}</span>
              <ChevronDown size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Brand bar ── */}
      <div className="bg-[#0B3D3A] px-4 py-3 border-b border-[#0F5450]/60">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="UdyamSetu AI Home">
            <div className="w-11 h-11 rounded-lg bg-[#E98A15] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 40 40" width="30" height="30" fill="none" aria-hidden="true">
                <path
                  d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z"
                  fill="#F5A832"
                  stroke="#0B3D3A"
                  strokeWidth="1"
                />
                <path d="M20 12 L26 18 L20 24 L14 18 Z" fill="#FAF8F3" />
                <rect x="6" y="26" width="28" height="3" fill="#0F7A4E" opacity="0.9" />
              </svg>
            </div>
            <div>
              <div className="text-[#FAF8F3] font-bold text-xl leading-tight tracking-tight">
                UdyamSetu AI
              </div>
              <div className="text-[#FAF8F3]/60 text-xs">{t.tagline}</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`nav-${link.href}`}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#146C64]/50 text-[#E98A15]'
                      : 'text-[#FAF8F3]/80 hover:text-[#FAF8F3] hover:bg-[#0F5450]/50'
                  }`}
                >
                  {link.icon && <link.icon size={14} className="opacity-75" />}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/assessment-wizard"
              className="ml-3 btn-saffron px-5 py-2 rounded-md text-sm font-semibold"
            >
              {t.freeAssessment}
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-[#FAF8F3] p-2 rounded-md hover:bg-[#0F5450]/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Tricolor divider ── */}
      <div className="tricolor-divider w-full" />

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0B3D3A] border-b border-[#0F5450]/60 px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`mobile-nav-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#146C64]/50 text-[#E98A15]'
                      : 'text-[#FAF8F3]/80 hover:text-[#FAF8F3] hover:bg-[#0F5450]/50'
                  }`}
                >
                  {link.icon && <link.icon size={15} />}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/assessment-wizard"
              onClick={() => setMobileOpen(false)}
              className="btn-saffron px-5 py-3 rounded-md text-sm text-center mt-2 font-semibold"
            >
              {t.freeAssessment}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}