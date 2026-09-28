'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { api, apiEndpoints, apiBaseUrl, setTokens, handleApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { AuthTokens, UserProfile } from '@/types';

// ============================================================
// Types
// ============================================================

interface RegisterResponse {
  user: UserProfile & { isNew: boolean };
  tokens: AuthTokens;
}

// ============================================================
// Main Register Page Component
// ============================================================

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const { t } = useTranslation();

  // Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phone validation: 10-digit Indian mobile
  const phoneValid = /^[6-9]\d{9}$/.test(phone.trim());

  // ============================================================
  // Handle Register
  // ============================================================

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phoneValid) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await api<RegisterResponse>(apiEndpoints.auth.register, {
        method: 'POST',
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim(),
          password: password,
        }),
      });

      setTokens(data.tokens);
      setSession(data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      handleApiError(err, 'Registration failed. Please try again.');
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // Shared header (Ashok Chakra emblem)
  // ============================================================

  const AppHeader = (
    <div className="bg-[#1A3A6B] px-8 py-7 text-center">
      <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#FF9933] bg-white flex items-center justify-center mb-4">
        <svg viewBox="0 0 60 60" width="44" height="44" fill="none" aria-hidden="true">
          <circle cx="30" cy="30" r="27" stroke="#1A3A6B" strokeWidth="2" fill="none" />
          <circle cx="30" cy="30" r="20" stroke="#E65C00" strokeWidth="1.5" fill="none" />
          <circle cx="30" cy="30" r="4" fill="#1A3A6B" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={30 + 7 * Math.cos(a)} y1={30 + 7 * Math.sin(a)}
                x2={30 + 18 * Math.cos(a)} y2={30 + 18 * Math.sin(a)}
                stroke="#1A3A6B" strokeWidth="1.2"
              />
            );
          })}
        </svg>
      </div>
      <div className="text-[#FF9933] text-xs font-bold uppercase tracking-widest mb-1">अर्थसेतु</div>
      <h1 className="text-white text-2xl font-bold">{t.auth.registerTitle}</h1>
      <p className="text-white/60 text-sm mt-1">{t.auth.joinNetwork}</p>
    </div>
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tricolor top bar */}
          <div className="tricolor-divider w-full" />

          {AppHeader}

          <div className="px-8 py-7">
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={() => {
                window.location.href = `${apiBaseUrl}${apiEndpoints.auth.google}`;
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-[#DDDDDD] bg-white text-[#555] font-semibold text-sm hover:border-[#4285F4] hover:bg-[#F8FAFC] transition-all shadow-sm mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.1C12.8 13.3 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.5 37.3 46.5 31.4 46.5 24.5z"/>
                <path fill="#FBBC05" d="M10.9 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6L2.4 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.4 10.7l8.5-6.1z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.2-3.8-13-9.3l-8 6.2C6.9 42.6 14.8 48 24 48z"/>
              </svg>
              {t.auth.continueGoogle}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-[#9CA3AF] font-medium">{t.auth.orRegisterPhone}</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <form onSubmit={handleRegister} noValidate className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-semibold text-[#333] mb-1.5">
                  {t.auth.fullName}
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-semibold text-[#333] mb-1.5">
                  {t.auth.phone} *
                </label>
                <div className="relative">
                  {/* Country code prefix */}
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#555] select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full pl-[5.5rem] pr-10 py-3 border-2 rounded-lg text-sm outline-none transition-all ${
                      phone.length > 0
                        ? phoneValid
                          ? 'border-[#138808] focus:border-[#138808] focus:shadow-[0_0_0_3px_rgba(19,136,8,0.10)]'
                          : 'border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
                        : 'border-[#DDDDDD] focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)]'
                    }`}
                    required
                  />
                  {phone.length > 0 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {phoneValid
                        ? <CheckCircle2 size={16} className="text-[#138808]" />
                        : <AlertCircle size={16} className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
                {phone.length > 0 && !phoneValid && (
                  <p className="mt-1 text-xs text-red-500">Must be a valid 10-digit Indian mobile number (starts with 6–9).</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-semibold text-[#333] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                  />
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-[#888] leading-relaxed">
                By creating an account you agree to our{' '}
                <a href="#" className="text-[#1A3A6B] underline hover:text-[#E65C00]">Terms of Use</a>{' '}
                and{' '}
                <a href="#" className="text-[#1A3A6B] underline hover:text-[#E65C00]">Privacy Policy</a>.
              </p>

              {/* Register button */}
              <button
                type="submit"
                disabled={loading || !phoneValid}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Registering...
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Login link */}
              <p className="text-center text-sm text-[#666]">
                {t.auth.hasAccount}{' '}
                <Link href="/login" className="text-[#1A3A6B] font-semibold hover:text-[#E65C00] transition-colors">
                  {t.auth.signIn}
                </Link>
              </p>
            </form>
          </div>

          <div className="tricolor-divider w-full" />
        </div>

        <p className="text-center text-xs text-[#888] mt-5">
          <Link href="/" className="hover:text-[#E65C00] transition-colors">← {t.auth.backToHome}</Link>
        </p>
      </div>
    </div>
  );
}
