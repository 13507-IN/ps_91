'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, Globe, LayoutDashboard, ShieldCheck, Settings,
  Home, FileText, BookOpen, ClipboardList,
  LogIn, LogOut, UserPlus, User,
} from 'lucide-react';
import { hasSession, setTokens, getRefreshToken, api, apiEndpoints } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';

type Lang = 'EN' | 'BN';

const NAV_LABELS: Record<Lang, Record<string, string>> = {
  EN: {
    home: 'Home', assess: 'Start Assessment', schemes: 'Schemes',
    sampleReport: 'Sample Report', dashboard: 'Dashboard', admin: 'Admin',
    settings: 'Settings', freeAssessment: 'Free Assessment',
    tagline: 'Rural Business Intelligence Platform',
    language: 'বাংলা', govIndia: 'भारत सरकार | Government of India',
    skipToMain: 'Skip to Main Content',
    login: 'Login', register: 'Register', logout: 'Logout',
  },
  BN: {
    home: 'হোম', assess: 'মূল্যায়ন শুরু করুন', schemes: 'প্রকল্পসমূহ',
    sampleReport: 'নমুনা রিপোর্ট', dashboard: 'ড্যাশবোর্ড', admin: 'অ্যাডমিন',
    settings: 'সেটিংস', freeAssessment: 'বিনামূল্যে মূল্যায়ন',
    tagline: 'গ্রামীণ ব্যবসায়িক তথ্য প্ল্যাটফর্ম',
    language: 'English', govIndia: 'ভারত সরকার | Government of India',
    skipToMain: 'মূল বিষয়বস্তুতে যান',
    login: 'লগইন', register: 'নিবন্ধন', logout: 'লগআউট',
  },
};

const NAV_LINKS = (t: Record<string, string>) => [
  { href: '/',                   label: t.home,         icon: Home,           requiresAuth: false },
  { href: '/assessment-wizard',  label: t.assess,       icon: ClipboardList,  requiresAuth: true  },
  { href: '/schemes',            label: t.schemes,      icon: BookOpen,       requiresAuth: false },
  { href: '/feasibility-report', label: t.sampleReport, icon: FileText,       requiresAuth: false },
  { href: '/dashboard',          label: t.dashboard,    icon: LayoutDashboard,requiresAuth: true  },
  { href: '/settings',           label: t.settings,     icon: Settings,       requiresAuth: true  },
  { href: '/admin',              label: t.admin,        icon: ShieldCheck,    requiresAuth: true  },
];

export default function GovHeaderBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const [loggedIn, setLoggedIn] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();
  const t        = NAV_LABELS[lang];
  const navLinks = NAV_LINKS(t);

  const { user, logout: storeLogout } = useAuthStore();

  // Re-check token whenever route changes (handles login/logout redirects)
  useEffect(() => {
    setLoggedIn(hasSession());
  }, [pathname]);

  async function handleLogout() {
    try {
      const rt = getRefreshToken();
      if (rt) {
        await api(apiEndpoints.auth.logout, {
          method: 'POST',
          body: JSON.stringify({ refreshToken: rt }),
        }).catch(() => { /* ignore backend errors on logout */ });
      }
    } finally {
      setTokens(null);
      storeLogout();
      setLoggedIn(false);
      router.push('/');
    }
  }

  return (
    <header className="w-full sticky top-0 z-50" role="banner">

      {/* ── Bar 1: Gov utility strip (light gray) ── */}
      <div className="gov-utility-bar px-4 py-1.5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:text-[#E65C00] underline text-xs">
              {t.skipToMain}
            </a>
            <span className="font-semibold text-[#1A3A6B] text-xs tracking-wide">{t.govIndia}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#555555]">
            {/* Text-size controls (A- / A / A+) */}
            <div className="hidden sm:flex items-center gap-1" aria-label="Text size">
              {['A-', 'A', 'A+'].map((s) => (
                <button key={s}
                  className="w-5 h-5 rounded border border-[#CCCCCC] text-[10px] font-bold hover:bg-[#E65C00] hover:text-white hover:border-[#E65C00] transition-colors"
                  aria-label={`Text size ${s}`}
                >{s}</button>
              ))}
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

      {/* ── Bar 2: White logo / brand bar ── */}
      <div className="gov-logo-bar px-4 py-3 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group" aria-label="UdyamSetu AI — Home">
            <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-[#1A3A6B] flex items-center justify-center bg-white shadow-sm">
              <svg viewBox="0 0 60 60" width="48" height="48" fill="none" aria-hidden="true">
                <circle cx="30" cy="30" r="27" stroke="#1A3A6B" strokeWidth="2"   fill="none" />
                <circle cx="30" cy="30" r="20" stroke="#E65C00" strokeWidth="1.5" fill="none" />
                <circle cx="30" cy="30" r="4"  fill="#1A3A6B" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return (
                    <line key={i}
                      x1={30 + 7  * Math.cos(a)} y1={30 + 7  * Math.sin(a)}
                      x2={30 + 18 * Math.cos(a)} y2={30 + 18 * Math.sin(a)}
                      stroke="#1A3A6B" strokeWidth="1.2"
                    />
                  );
                })}
              </svg>
            </div>
            <div>
              <div className="text-[#E65C00] text-xs font-bold uppercase tracking-widest leading-none mb-0.5">उद्यमसेतु AI</div>
              <div className="text-[#1A3A6B] font-extrabold text-2xl leading-tight tracking-tight">UdyamSetu AI</div>
              <div className="text-[#555555] text-xs font-normal leading-none mt-0.5">{t.tagline}</div>
            </div>
          </Link>

          {/* Right side: scheme badges + auth buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Scheme partner badges */}
            <div className="flex items-center gap-2">
              {[
                { label: 'PMEGP', color: '#1A3A6B' },
                { label: 'MUDRA', color: '#138808' },
                { label: 'UDYAM', color: '#E65C00' },
                { label: 'PMFME', color: '#8B0000' },
              ].map((b) => (
                <div key={b.label}
                  className="w-14 h-14 rounded-lg border-2 flex items-center justify-center bg-white shadow-sm text-xs font-bold"
                  style={{ borderColor: b.color, color: b.color }}
                  aria-label={b.label}
                >{b.label}</div>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-2 border-l border-[#EEEEEE] pl-4">
              {loggedIn ? (
                <>
                  {user?.name && (
                    <span className="hidden xl:flex items-center gap-1.5 text-xs text-[#444] font-medium mr-1">
                      <User size={13} className="text-[#1A3A6B]" />
                      {user.name}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDDDDD] text-xs font-semibold text-[#555] hover:border-red-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={13} /> {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1A3A6B] text-xs font-semibold text-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white transition-colors">
                    <LogIn size={13} /> {t.login}
                  </Link>
                  <Link href="/register"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E65C00] text-xs font-bold text-white hover:bg-[#CC5200] transition-colors">
                    <UserPlus size={13} /> {t.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tricolor divider (saffron | white | green) ── */}
      <div className="tricolor-divider w-full" aria-hidden="true" />

      {/* ── Bar 3: Dark navy nav strip ── */}
      <nav className="gov-nav-bar shadow-md" aria-label="Main navigation">
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center">

          {/* Desktop links */}
          <div className="hidden lg:flex items-center flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const blocked  = link.requiresAuth && !loggedIn;
              return (
                <Link
                  key={`nav-${link.href}`}
                  href={blocked ? `/login?next=${encodeURIComponent(link.href)}` : link.href}
                  className={`nav-link-gov flex items-center gap-1.5 border-r border-white/10 ${isActive ? 'active' : ''} ${blocked ? 'opacity-50' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={blocked ? 'Login required' : undefined}
                >
                  <link.icon size={13} className="opacity-80 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block ml-auto py-1">
            {loggedIn ? (
              <Link href="/assessment-wizard"
                className="inline-flex items-center gap-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-sm px-5 py-2 rounded transition-colors">
                {t.freeAssessment} →
              </Link>
            ) : (
              <Link href="/register"
                className="inline-flex items-center gap-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-sm px-5 py-2 rounded transition-colors">
                <UserPlus size={14} /> {t.register} →
              </Link>
            )}
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

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden bg-[#1A3A6B] border-b border-white/10 shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const blocked  = link.requiresAuth && !loggedIn;
              return (
                <Link
                  key={`mob-${link.href}`}
                  href={blocked ? `/login?next=${encodeURIComponent(link.href)}` : link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#E65C00] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                  } ${blocked ? 'opacity-50' : ''}`}
                >
                  <link.icon size={16} className="flex-shrink-0" />
                  {link.label}
                  {blocked && <span className="ml-auto text-[10px] text-white/40">Login required</span>}
                </Link>
              );
            })}

            {/* Auth section in mobile drawer */}
            <div className="border-t border-white/15 mt-2 pt-2 space-y-1">
              {loggedIn ? (
                <>
                  {user?.name && (
                    <p className="px-4 py-1 text-xs text-white/50">
                      Signed in as <span className="font-semibold text-white/75">{user.name}</span>
                    </p>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={16} /> {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <LogIn size={16} /> {t.login}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold px-5 py-3 rounded text-sm transition-colors mt-1">
                    <UserPlus size={16} /> {t.register}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
