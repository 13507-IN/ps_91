'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, ChevronDown, Globe, LayoutDashboard,
  ShieldCheck, Settings, Home, FileText, BookOpen, ClipboardList,
} from 'lucide-react';

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
    tagline: 'Rural Business Intelligence Platform',
    language: 'বাংলা',
    govIndia: 'भारत सरकार | Government of India',
    skipToMain: 'Skip to Main Content',
    screenReader: 'Screen Reader Access',
    lastUpdated: 'Last Updated',
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
    tagline: 'গ্রামীণ ব্যবসায়িক তথ্য প্ল্যাটফর্ম',
    language: 'English',
    govIndia: 'ভারত সরকার | Government of India',
    skipToMain: 'মূল বিষয়বস্তুতে যান',
    screenReader: 'স্ক্রিন রিডার',
    lastUpdated: 'সর্বশেষ আপডেট',
  },
};

const NAV_LINKS = (t: Record<string, string>) => [
  { href: '/', label: t.home, icon: Home },
  { href: '/assessment-wizard', label: t.assess, icon: ClipboardList },
  { href: '/schemes', label: t.schemes, icon: BookOpen },
  { href: '/feasibility-report', label: t.sampleReport, icon: FileText },
  { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
  { href: '/settings', label: t.settings, icon: Settings },
  { href: '/admin', label: t.admin, icon: ShieldCheck },
];

export default function GovHeaderBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const pathname = usePathname();
  const t = NAV_LABELS[lang];
  const navLinks = NAV_LINKS(t);

  return (
    <header className="w-full sticky top-0 z-50" role="banner">
      {/* ── Bar 1: Government of India utility strip (light gray, like mha.gov.in) ── */}
      <div className="gov-utility-bar px-4 py-1.5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:text-[#E65C00] underline text-xs"
            >
              {t.skipToMain}
            </a>
            <span className="font-semibold text-[#1A3A6B] text-xs tracking-wide">
              {t.govIndia}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#555555]">
            {/* Text size controls — MHA style */}
            <div className="hidden sm:flex items-center gap-1" aria-label="Text size">
              <button className="w-5 h-5 rounded border border-[#CCCCCC] text-[10px] font-bold hover:bg-[#E65C00] hover:text-white hover:border-[#E65C00] transition-colors" aria-label="Decrease text size">A-</button>
              <button className="w-5 h-5 rounded border border-[#CCCCCC] text-xs font-bold hover:bg-[#E65C00] hover:text-white hover:border-[#E65C00] transition-colors" aria-label="Normal text size">A</button>
              <button className="w-5 h-5 rounded border border-[#CCCCCC] text-sm font-bold hover:bg-[#E65C00] hover:text-white hover:border-[#E65C00] transition-colors" aria-label="Increase text size">A+</button>
            </div>
            <span className="hidden sm:inline text-[#CCCCCC]">|</span>
            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="flex items-center gap-1 text-[#1A3A6B] hover:text-[#E65C00] transition-colors font-medium"
              aria-label="Toggle language"
            >
              <Globe size={12} />
              <span>{t.language}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bar 2: Logo / Brand bar (white background) ── */}
      <div className="gov-logo-bar px-4 py-3 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & brand identity */}
          <Link href="/" className="flex items-center gap-4 group" aria-label="UdyamSetu AI — Home">
            {/* Emblem placeholder — Ashoka Chakra style ring */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-[#1A3A6B] flex items-center justify-center bg-white shadow-sm">
              <svg viewBox="0 0 60 60" width="48" height="48" fill="none" aria-hidden="true">
                {/* Outer ring */}
                <circle cx="30" cy="30" r="27" stroke="#1A3A6B" strokeWidth="2" fill="none"/>
                {/* Inner ring */}
                <circle cx="30" cy="30" r="20" stroke="#E65C00" strokeWidth="1.5" fill="none"/>
                {/* Center dot */}
                <circle cx="30" cy="30" r="4" fill="#1A3A6B"/>
                {/* Spokes like Ashoka Chakra */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 30 + 7 * Math.cos(angle);
                  const y1 = 30 + 7 * Math.sin(angle);
                  const x2 = 30 + 18 * Math.cos(angle);
                  const y2 = 30 + 18 * Math.sin(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1A3A6B" strokeWidth="1.2" />;
                })}
              </svg>
            </div>

            {/* Brand text */}
            <div>
              <div className="text-[#E65C00] text-xs font-bold uppercase tracking-widest leading-none mb-0.5">
                उद्यमसेतु AI
              </div>
              <div className="text-[#1A3A6B] font-extrabold text-2xl leading-tight tracking-tight">
                UdyamSetu AI
              </div>
              <div className="text-[#555555] text-xs font-normal leading-none mt-0.5 max-w-xs">
                {t.tagline}
              </div>
            </div>
          </Link>

          {/* Right side: scheme logos / trust badges (like MHA partner logos) */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { label: 'PMEGP', color: '#1A3A6B' },
              { label: 'MUDRA', color: '#138808' },
              { label: 'UDYAM', color: '#E65C00' },
              { label: 'PMFME', color: '#8B0000' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="w-14 h-14 rounded-lg border-2 flex items-center justify-center bg-white shadow-sm text-xs font-bold"
                style={{ borderColor: badge.color, color: badge.color }}
                aria-label={badge.label}
              >
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tricolor divider ── */}
      <div className="tricolor-divider w-full" aria-hidden="true" />

      {/* ── Bar 3: Main navigation (dark navy, like MHA) ── */}
      <nav className="gov-nav-bar shadow-md" aria-label="Main navigation">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center">
          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`nav-${link.href}`}
                  href={link.href}
                  className={`nav-link-gov flex items-center gap-1.5 border-r border-white/10 ${
                    isActive ? 'active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <link.icon size={13} className="opacity-80 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA button (desktop) */}
          <div className="hidden lg:block ml-auto py-1">
            <Link
              href="/assessment-wizard"
              className="inline-flex items-center gap-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-sm px-5 py-2 rounded transition-colors"
            >
              {t.freeAssessment} →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center justify-between w-full py-1">
            <span className="text-white text-sm font-medium opacity-80">Menu</span>
            <button
              className="text-white p-2 rounded hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu drawer ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-[#1A3A6B] border-b border-white/10 shadow-lg"
        >
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`mob-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E65C00] text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <link.icon size={16} className="flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/assessment-wizard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold px-5 py-3 rounded text-sm transition-colors"
            >
              {t.freeAssessment} →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
