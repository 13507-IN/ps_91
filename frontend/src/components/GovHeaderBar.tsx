'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, ShieldCheck, Settings,
  Home, FileText, BookOpen, ClipboardList,
  LogIn, LogOut, UserPlus, User, PlayCircle,
} from 'lucide-react';
import { hasSession, setTokens, getRefreshToken, api, apiEndpoints } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslation } from '@/lib/i18n/useTranslation';

const NAV_LINKS = (t: ReturnType<typeof useTranslation>['t']) => [
  { href: '/',                   label: t.nav.home,         icon: Home,           requiresAuth: false, adminOnly: false },
  { href: '/assessment-wizard',  label: t.nav.assess,       icon: ClipboardList,  requiresAuth: true,  adminOnly: false },
  { href: '/schemes',            label: t.nav.schemes,      icon: BookOpen,       requiresAuth: false, adminOnly: false },
  { href: '/seasonal-calendar',  label: t.nav.seasonalCalendar, icon: FileText,       requiresAuth: false, adminOnly: false },
  { href: '/community',          label: t.nav.communityHub,     icon: ShieldCheck,    requiresAuth: false, adminOnly: false },
  { href: '/success-stories',    label: t.nav.successStories,   icon: BookOpen,       requiresAuth: false, adminOnly: false },
  { href: '/feasibility-report', label: t.nav.sampleReport, icon: FileText,       requiresAuth: false, adminOnly: false },
  { href: '/dashboard',          label: t.nav.dashboard,    icon: LayoutDashboard,requiresAuth: true,  adminOnly: false },
  { href: '/settings',           label: t.nav.settings,     icon: Settings,       requiresAuth: true,  adminOnly: false },
  { href: '/admin',              label: t.nav.admin,        icon: ShieldCheck,    requiresAuth: true,  adminOnly: true  },
];

export default function GovHeaderBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();
  const { t, lang, setLang } = useTranslation();
  const navLinks = NAV_LINKS(t);

  const { user, logout: storeLogout } = useAuthStore();

  const isAdmin = Boolean(
    user && (
      user.role === 'ADMIN' ||
      user.email?.toLowerCase().includes('admin') ||
      user.phone === '9999999999' ||
      user.phone === '9876543210'
    )
  );

  const visibleNavLinks = navLinks.filter((link) => !link.adminOnly || isAdmin);

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

      {/* ── Scrolling headline ticker ── */}
      <div className="overflow-hidden border-b border-white/10 bg-[#0d1f47] text-white">
        <div className="ticker-mask relative mx-auto max-w-screen-2xl">
          <div className="ticker-track flex min-w-max items-center gap-8 whitespace-nowrap py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 sm:text-xs">
            {[...t.ticker.items, ...t.ticker.items].map((item, idx) => (
              <div key={`${item}-${idx}`} className="flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF9933]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main header bar: White logo / brand bar ── */}
      <div className="gov-logo-bar px-4 py-3 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group" aria-label="ArthSetu — Home">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-emerald-700/30 flex items-center justify-center bg-white shadow-sm p-1 transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ArthSetu Logo" className="w-full h-full rounded-xl object-contain" />
            </div>
            <div>
              <div className="text-[#E65C00] text-xs font-bold uppercase tracking-widest leading-none mb-0.5">अर्थसेतु</div>
              <div className="text-[#1A3A6B] font-extrabold text-2xl leading-tight tracking-tight">ArthSetu</div>
              <div className="text-[#555555] text-xs font-normal leading-none mt-0.5">{t.common.tagline}</div>
            </div>
          </Link>

          {/* Right side: scheme image + auth buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Government initiative badge image */}
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/9.png"
                alt="Government initiative badges"
                className="h-14 w-auto object-contain"
              />
            </div>

            {/* Language Toggle + Video Tour + Auth buttons */}
            <div className="flex items-center gap-2 border-l border-[#EEEEEE] pl-4">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-arthsetu-intro'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-600/40 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Watch Intro Video"
              >
                <PlayCircle size={14} className="text-emerald-700" />
                <span>{lang === 'BN' ? 'ভিডিও গাইড' : lang === 'HI' ? 'वीडियो टूर' : 'Intro Video'}</span>
              </button>

              <button
                onClick={() => setLang(lang === 'EN' ? 'BN' : lang === 'BN' ? 'HI' : 'EN')}
                className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded border border-[#1A3A6B] text-xs font-semibold text-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white transition-colors"
                title="Switch Language"
              >
                {lang === 'EN' ? 'বাংলা' : lang === 'BN' ? 'हिंदी' : 'English'}
              </button>
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
                    <LogOut size={13} /> {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1A3A6B] text-xs font-semibold text-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white transition-colors">
                    <LogIn size={13} /> {t.nav.login}
                  </Link>
                  <Link href="/register"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E65C00] text-xs font-bold text-white hover:bg-[#CC5200] transition-colors">
                    <UserPlus size={13} /> {t.nav.register}
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
            {visibleNavLinks.map((link) => {
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
                {t.nav.freeAssessment} →
              </Link>
            ) : (
              <Link href="/register"
                className="inline-flex items-center gap-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold text-sm px-5 py-2 rounded transition-colors">
                <UserPlus size={14} /> {t.nav.register} →
              </Link>
            )}
          </div>

          {/* Mobile hamburger & language switcher */}
          <div className="lg:hidden flex items-center justify-between w-full py-1">
            <span className="text-white text-sm font-medium opacity-80">Menu</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'EN' ? 'BN' : lang === 'BN' ? 'HI' : 'EN')}
                className="px-2.5 py-1 rounded border border-white/30 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                title="Switch Language"
              >
                {lang === 'EN' ? 'বাংলা' : lang === 'BN' ? 'हिंदी' : 'English'}
              </button>
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
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-[#1A3A6B] border-b border-white/10 shadow-2xl max-h-[calc(100dvh-110px)] overflow-y-auto"
        >
          <nav className="flex flex-col px-3 py-2 gap-0.5" aria-label="Mobile navigation">
            {visibleNavLinks.map((link) => {
              const isActive = pathname === link.href;
              const blocked  = link.requiresAuth && !loggedIn;
              return (
                <Link
                  key={`mob-${link.href}`}
                  href={blocked ? `/login?next=${encodeURIComponent(link.href)}` : link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#E65C00] text-white font-semibold' : 'text-white/85 hover:text-white hover:bg-white/10'
                  } ${blocked ? 'opacity-60' : ''}`}
                >
                  <link.icon size={15} className="flex-shrink-0 opacity-90" />
                  <span>{link.label}</span>
                  {blocked && <span className="ml-auto text-[10px] text-white/40">{t.common.loginRequired}</span>}
                </Link>
              );
            })}

            {/* Auth section in mobile drawer */}
            <div className="border-t border-white/15 mt-1.5 pt-2 pb-1.5">
              {loggedIn ? (
                <div className="space-y-1">
                  {user?.name && (
                    <p className="px-3 py-0.5 text-[11px] text-white/60">
                      Signed in as <span className="font-semibold text-white/90">{user.name}</span>
                    </p>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold text-white/90 bg-white/10 hover:bg-red-600/80 transition-colors"
                  >
                    <LogOut size={15} /> {t.nav.logout}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-white/30 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <LogIn size={14} /> {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 bg-[#E65C00] hover:bg-[#CC5200] text-white font-bold px-3 py-2 rounded text-xs transition-colors shadow-sm"
                  >
                    <UserPlus size={14} /> {t.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
