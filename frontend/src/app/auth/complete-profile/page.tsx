'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { api, apiEndpoints, setTokens, handleApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import type { AuthTokens, UserProfile } from '@/types';

interface SendOtpResponse {
  message: string;
  expiresInMinutes: number;
  devOtp?: string;
}

interface VerifyOtpResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join('').replace(/ /g, ''));
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : (digits[i] ?? '')}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoFocus={i === 0}
          className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all ${
            digits[i] && digits[i] !== ' '
              ? 'border-[#E65C00] bg-[#FFF7F0] text-[#E65C00]'
              : 'border-[#DDDDDD] bg-white text-[#333]'
          } focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.15)] disabled:opacity-50`}
        />
      ))}
    </div>
  );
}

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const tempToken = searchParams.get('tempToken') || '';
  const initialName = searchParams.get('name') || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const phoneValid = /^[6-9]\d{9}$/.test(phone.trim());

  useEffect(() => {
    if (!tempToken) {
      router.replace('/login');
    }
  }, [tempToken, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phoneValid) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const data = await api<SendOtpResponse>(apiEndpoints.auth.googleLinkSendOtp, {
        method: 'POST',
        body: JSON.stringify({ tempToken, phone: phone.trim() }),
      });

      if (data.devOtp) setDevOtp(data.devOtp);
      setStep(2);
      setResendCooldown(30);
    } catch (err: unknown) {
      handleApiError(err, 'Failed to send OTP.');
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const data = await api<VerifyOtpResponse>(apiEndpoints.auth.googleLinkVerifyOtp, {
        method: 'POST',
        body: JSON.stringify({
          tempToken,
          phone: phone.trim(),
          code: otpCode,
          whatsappOptIn,
        }),
      });

      setTokens(data.tokens);
      setSession(data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      handleApiError(err, 'OTP verification failed.');
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#EEEEEE]">
        <div className="tricolor-divider w-full" />

        {/* Header */}
        <div className="bg-[#1A3A6B] px-8 py-7 text-center">
          <div className="mx-auto w-14 h-14 rounded-full border-2 border-[#FF9933] bg-white flex items-center justify-center mb-3">
            <MessageSquare size={28} className="text-[#25D366]" />
          </div>
          <div className="text-[#FF9933] text-xs font-bold uppercase tracking-widest mb-1">
            {initialName ? `Welcome, ${initialName}` : 'Almost Done!'}
          </div>
          <h1 className="text-white text-xl font-bold">Link Verified WhatsApp Number</h1>
          <p className="text-white/70 text-xs mt-1">
            Verify your mobile number to receive full feasibility reports & market updates via WhatsApp.
          </p>
        </div>

        <div className="px-8 py-7">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="mobile-number" className="block text-sm font-semibold text-[#333] mb-1.5">
                  WhatsApp Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#555] select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    id="mobile-number"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full pl-[5.5rem] pr-10 py-3 border-2 border-[#DDDDDD] rounded-lg text-sm outline-none focus:border-[#E65C00] focus:shadow-[0_0_0_3px_rgba(230,92,0,0.12)] transition-all"
                    required
                  />
                  {phoneValid && (
                    <CheckCircle2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#138808]" />
                  )}
                </div>
              </div>

              {/* WhatsApp Opt-in Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer bg-[#F0FDF4] border border-[#BBF7D0] p-3 rounded-lg">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#25D366] rounded"
                />
                <span className="text-xs text-[#166534] leading-relaxed">
                  Send full enterprise reports, government scheme matches & market alerts to this WhatsApp number.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !phoneValid}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-60 text-white font-bold text-base transition-colors"
              >
                {loading ? 'Sending Verification OTP…' : (
                  <>
                    <Phone size={16} />
                    Verify via SMS OTP
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-lg px-4 py-3 text-sm text-[#1E40AF]">
                <p className="font-semibold">Verification OTP sent to +91 {phone}</p>
                <p className="text-xs mt-0.5 text-[#3B82F6]">Enter the 6-digit SMS code below to confirm ownership.</p>
              </div>

              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-sm text-yellow-800 font-mono">
                  Dev OTP: <strong>{devOtp}</strong>
                </div>
              )}

              <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] disabled:opacity-60 text-white font-bold text-base transition-colors"
              >
                {loading ? 'Verifying…' : (
                  <>
                    <ShieldCheck size={16} />
                    Verify & Activate WhatsApp Service
                  </>
                )}
              </button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-[#9CA3AF]">Resend code in {resendCooldown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-[#1A3A6B] font-semibold flex items-center gap-1 mx-auto hover:underline"
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        <div className="tricolor-divider w-full" />
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-sm text-[#555]">Loading verification form...</div>}>
        <CompleteProfileForm />
      </Suspense>
    </div>
  );
}
