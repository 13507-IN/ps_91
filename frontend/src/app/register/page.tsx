'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, apiEndpoints, setTokens, handleApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import type { AuthTokens, UserProfile } from '@/types';

interface RegisterResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pwFocused, setPwFocused] = useState(false);

  const phoneValid = /^[6-9]\d{9}$/.test(phone.trim());
  const pwStrong = PASSWORD_RULES.every((r) => r.test(password));
  const pwMatch = password === confirm && confirm.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phoneValid) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (!pwStrong) { setError('Password does not meet the requirements below.'); return; }
    if (!pwMatch) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const body: Record<string, string> = { phone: phone.trim(), password };
      if (name.trim()) body.name = name.trim();

      const data = await api<RegisterResponse>(apiEndpoints.auth.register, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setTokens(data.tokens);
      setSession(data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('duplicate'))) {
        setError('This mobile number is already registered. Please login instead.');
      } else {
        handleApiError(err, 'Registration failed.');
      }
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
              ArthSetu
            </div>
            <h1 className="text-white text-2xl font-bold">Create Account</h1>
            <p className="text-white/60 text-sm mt-1">Free · takes under a minute</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="px-8 py-7 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Name (optional) */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-[#333] mb-1.5">
                Full Name <span className="text-[#999] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-semibold text-[#333] mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg text-sm outline-none transition-all ${
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
                <p className="mt-1 text-xs text-red-500">Must be a valid 10-digit Indian mobile number.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[#333] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocused(true)}
                  placeholder="Create a password"
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

              {/* Password strength checklist */}
              {(pwFocused || password.length > 0) && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const pass = rule.test(password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${pass ? 'text-[#138808]' : 'text-[#999]'}`}>
                        <CheckCircle2 size={12} className={pass ? 'text-[#138808]' : 'text-[#CCC]'} />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-[#333] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-11 py-3 border-2 rounded-lg text-sm outline-none transition-all ${
                    confirm.length > 0
                      ? pwMatch
                        ? 'border-[#138808] focus:border-[#138808]'
                        : 'border-red-400 focus:border-red-400'
                      : 'border-[#DDDDDD] focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#555] transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && !pwMatch && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
              )}
            </div>

            {/* Terms note */}
            <p className="text-xs text-[#888] leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="text-[#1A3A6B] underline hover:text-[#E65C00]">Terms of Use</a>{' '}
              and{' '}
              <a href="#" className="text-[#1A3A6B] underline hover:text-[#E65C00]">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-[#666]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1A3A6B] font-semibold hover:text-[#E65C00] transition-colors">
                Sign in
              </Link>
            </p>
          </form>

          <div className="tricolor-divider w-full" />
        </div>

        <p className="text-center text-xs text-[#888] mt-5">
          <Link href="/" className="hover:text-[#E65C00] transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
