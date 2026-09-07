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

      {/* ══════════════════════════════════════════════════════
          Bar 0 — Government Initiative Badges (MHA top strip)
          White background, logo row left-aligned, right side
          mirrors the MHA.gov.in badge row exactly in spirit.
         ══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-[#E8E8E8] px-4 py-2 hidden sm:block">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">

          {/* Left — "भारत सरकार | GOVERNMENT OF INDIA" text mark */}
          <div className="flex items-center gap-3">
            <div className="text-[10px] leading-tight text-[#333]">
              <div className="font-bold tracking-wider text-[#1A3A6B]">भारत सरकार</div>
              <div className="font-semibold tracking-widest uppercase text-[#555]">Government of India</div>
            </div>
          </div>

          {/* Right — 4 initiative badges matching the MHA row */}
          <div className="flex items-center gap-4">

            {/* Badge 1 — Swachh Bharat Mission style */}
            <div className="flex flex-col items-center gap-0.5 group cursor-default" title="Swachh Bharat Mission">
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg viewBox="0 0 56 56" width="48" height="48" fill="none" aria-hidden="true">
                  {/* Outer circle with Gandhi-glasses motif */}
                  <circle cx="28" cy="28" r="26" stroke="#222" strokeWidth="1.5" fill="white"/>
                  {/* Left lens */}
                  <circle cx="18" cy="28" r="8" stroke="#222" strokeWidth="1.5" fill="none"/>
                  {/* Right lens */}
                  <circle cx="38" cy="28" r="8" stroke="#222" strokeWidth="1.5" fill="none"/>
                  {/* Bridge */}
                  <line x1="26" y1="28" x2="30" y2="28" stroke="#222" strokeWidth="1.5"/>
                  {/* Left temple arm */}
                  <line x1="2" y1="28" x2="10" y2="28" stroke="#222" strokeWidth="1.5"/>
                  {/* Right temple arm */}
                  <line x1="46" y1="28" x2="54" y2="28" stroke="#222" strokeWidth="1.5"/>
                  {/* Tricolor stripe in left lens */}
                  <clipPath id="lensL"><circle cx="18" cy="28" r="7.5"/></clipPath>
                  <rect x="10.5" y="24" width="15" height="2.7" fill="#FF9933" clipPath="url(#lensL)"/>
                  <rect x="10.5" y="26.7" width="15" height="2.6" fill="white" clipPath="url(#lensL)"/>
                  <rect x="10.5" y="29.3" width="15" height="2.7" fill="#138808" clipPath="url(#lensL)"/>
                  {/* Tricolor stripe in right lens */}
                  <clipPath id="lensR"><circle cx="38" cy="28" r="7.5"/></clipPath>
                  <rect x="30.5" y="24" width="15" height="2.7" fill="#FF9933" clipPath="url(#lensR)"/>
                  <rect x="30.5" y="26.7" width="15" height="2.6" fill="white" clipPath="url(#lensR)"/>
                  <rect x="30.5" y="29.3" width="15" height="2.7" fill="#138808" clipPath="url(#lensR)"/>
                </svg>
              </div>
              <div className="text-center leading-none">
                <div className="text-[9px] font-bold text-[#E65C00]">स्वच्छ भारत</div>
                <div className="text-[7.5px] text-[#555] mt-0.5">एक कदम स्वच्छता की ओर</div>
              </div>
            </div>

            {/* Vertical rule */}
            <div className="w-px h-12 bg-[#E0E0E0]" aria-hidden="true"/>

            {/* Badge 2 — G20 India 2023 style */}
            <div className="flex flex-col items-center gap-0.5 group cursor-default" title="G20 India 2023">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 56 56" width="48" height="48" fill="none" aria-hidden="true">
                  <rect width="56" height="56" rx="6" fill="#FFF8F0"/>
                  {/* "G20" text mark */}
                  <text x="28" y="26" textAnchor="middle" fontSize="14" fontWeight="900"
                    fill="#1A3A6B" fontFamily="Arial,sans-serif">G20</text>
                  {/* Lotus petals (India presidency symbol) */}
                  {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
                    const r = (deg * Math.PI) / 180;
                    const cx = 28 + 11 * Math.cos(r);
                    const cy = 38 + 11 * Math.sin(r);
                    return (
                      <ellipse key={i} cx={cx} cy={cy} rx="3.5" ry="6"
                        transform={`rotate(${deg + 90},${cx},${cy})`}
                        fill={i % 3 === 0 ? '#FF9933' : i % 3 === 1 ? '#138808' : '#1A3A6B'}
                        opacity="0.75"/>
                    );
                  })}
                  {/* Centre dot */}
                  <circle cx="28" cy="38" r="3" fill="#1A3A6B"/>
                </svg>
              </div>
              <div className="text-center leading-none">
                <div className="text-[9px] font-bold text-[#1A3A6B]">भारत 2023</div>
                <div className="text-[7px] text-[#555] mt-0.5">ONE EARTH · ONE FAMILY</div>
              </div>
            </div>

            {/* Vertical rule */}
            <div className="w-px h-12 bg-[#E0E0E0]" aria-hidden="true"/>

            {/* Badge 3 — Yoga / Wellness India style */}
            <div className="flex flex-col items-center gap-0.5 group cursor-default" title="International Day of Yoga">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 56 56" width="48" height="48" fill="none" aria-hidden="true">
                  {/* Sky-blue circle bg */}
                  <circle cx="28" cy="28" r="27" fill="#E8F4FF" stroke="#7EC8E3" strokeWidth="1"/>
                  {/* Sun at top */}
                  <circle cx="28" cy="10" r="5" fill="#FF9933"/>
                  {[0,45,90,135,180,225,270,315].map((deg) => {
                    const r = (deg * Math.PI) / 180;
                    return <line key={deg}
                      x1={28 + 6 * Math.cos(r)} y1={10 + 6 * Math.sin(r)}
                      x2={28 + 9 * Math.cos(r)} y2={10 + 9 * Math.sin(r)}
                      stroke="#FF9933" strokeWidth="1.2"/>;
                  })}
                  {/* Yoga figure — sitting pose silhouette */}
                  {/* Head */}
                  <circle cx="28" cy="22" r="4" fill="#1A3A6B"/>
                  {/* Body */}
                  <path d="M28 26 Q20 32 22 38 Q28 34 34 38 Q36 32 28 26Z" fill="#138808"/>
                  {/* Arms in tree/prayer pose */}
                  <path d="M22 30 Q16 26 18 22" stroke="#1A3A6B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M34 30 Q40 26 38 22" stroke="#1A3A6B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  {/* Ground line */}
                  <path d="M14 43 Q28 40 42 43" stroke="#138808" strokeWidth="1.5" fill="none"/>
                  {/* Legs */}
                  <path d="M22 38 Q18 43 22 44" stroke="#1A3A6B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M34 38 Q38 43 34 44" stroke="#1A3A6B" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-center leading-none">
                <div className="text-[9px] font-bold text-[#1A3A6B]">Yoga</div>
                <div className="text-[7px] text-[#555] mt-0.5">Harmony &amp; Peace</div>
              </div>
            </div>

            {/* Vertical rule */}
            <div className="w-px h-12 bg-[#E0E0E0]" aria-hidden="true"/>

            {/* Badge 4 — Cyber Dost / Digital Safety style */}
            <div className="flex flex-col items-center gap-0.5 group cursor-default" title="Cyber Dost — Stay Safe Online">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 56 56" width="48" height="48" fill="none" aria-hidden="true">
                  {/* Circular badge bg */}
                  <circle cx="28" cy="28" r="27" fill="#FFF3E0" stroke="#E65C00" strokeWidth="2"/>
                  {/* Outer ring accent */}
                  <circle cx="28" cy="28" r="22" stroke="#1A3A6B" strokeWidth="1" fill="none" strokeDasharray="4 2"/>
                  {/* Shield shape */}
                  <path d="M28 10 L38 15 L38 26 C38 33 28 40 28 40 C28 40 18 33 18 26 L18 15 Z"
                    fill="#1A3A6B"/>
                  {/* Lock body */}
                  <rect x="24" y="27" width="8" height="7" rx="1.5" fill="#FF9933"/>
                  {/* Lock shackle */}
                  <path d="M25 27 L25 24 Q28 21 31 24 L31 27" stroke="#FF9933" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  {/* "CD" text below shield */}
                  <text x="28" y="52" textAnchor="middle" fontSize="7.5" fontWeight="800"
                    fill="#1A3A6B" fontFamily="Arial,sans-serif" letterSpacing="1">CYBER DOST</text>
                </svg>
              </div>
              <div className="text-center leading-none">
                <div className="text-[9px] font-bold text-[#E65C00]">Cyber Dost</div>
                <div className="text-[7px] text-[#555] mt-0.5">Stay Safe Online</div>
              </div>
            </div>

          </div>
        </div>
      </div>

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
