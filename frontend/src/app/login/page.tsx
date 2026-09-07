'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { api, apiEndpoints, setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import type { AuthTokens, UserProfile } from '@/types';

interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read ?next= param for post-login redirect
  const [nextPath] = React.useState(() => {
    if (typeof window === 'undefined') return '/assessment-wizard';
    const p = new URLSearchParams(window.location.search).get('next');
    return p && p.startsWith('/') ? p : '/assessment-wizard';
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password) {
      setError('Phone number and password are required.');
      return;
    }
    setLoading(true);
    try {
      const data = await api<LoginResponse>(apiEndpoints.auth.login, {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      setTokens(data.tokens);
      setSession(data.user);
      router.replace(nextPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg.includes('credentials') || msg.includes('401') ? 'Invalid phone or password.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tricolor top */}
          <div className="tricolor-divider w-full" />

          {/* Header */}
          <div className="bg-[#1A3A6B] px-8 py-7 text-center">
            {/* Emblem */}
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
            <div className="text-[#FF9933] text-xs font-bold uppercase tracking-widest mb-1">
              उद्यमसेतु AI
            </div>
            <h1 className="text-white text-2xl font-bold">Welcome Back</h1>
            <p className="text-white/60 text-sm mt-1">Sign in to access your assessments</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="px-8 py-7 space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Phone */}
            <div>
              <label htmlFor="login-phone" className="block text-sm font-semibold text-[#333] mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={13}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-semibold text-[#333]">
                  Password
                </label>
                <a href="#" className="text-xs text-[#E65C00] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-11 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555] transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-[#666]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#1A3A6B] font-semibold hover:text-[#E65C00] transition-colors">
                Create account
              </Link>
            </p>
          </form>

          {/* Tricolor bottom */}
          <div className="tricolor-divider w-full" />
        </div>

        {/* Back to home */}
        <p className="text-center text-xs text-[#888] mt-5">
          <Link href="/" className="hover:text-[#E65C00] transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
