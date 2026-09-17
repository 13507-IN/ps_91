'use client';
import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, apiEndpoints, setTokens, handleApiError } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import type { UserProfile } from '@/types';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const tempToken = searchParams.get('tempToken');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (tempToken) {
      const target = new URLSearchParams();
      target.set('tempToken', tempToken);
      if (name) target.set('name', name);
      router.replace(`/auth/complete-profile?${target.toString()}`);
      return;
    }

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      api<UserProfile>(apiEndpoints.users.me)
        .then((user) => {
          setSession(user);
          router.replace('/dashboard');
        })
        .catch((err) => {
          handleApiError(err, 'Failed to retrieve profile after Google login');
          router.replace('/login');
        });
    } else {
      router.replace('/login');
    }
  }, [router, searchParams, setSession]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-sm w-full space-y-4 border border-[#EEEEEE]">
      <div className="mx-auto w-12 h-12 rounded-full border-4 border-[#E65C00] border-t-transparent animate-spin" />
      <h2 className="text-lg font-bold text-[#1A3A6B]">Completing Google Sign-in…</h2>
      <p className="text-xs text-[#666]">Connecting your profile securely to ArthSetu</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-sm w-full space-y-4 border border-[#EEEEEE]">
            <div className="mx-auto w-12 h-12 rounded-full border-4 border-[#E65C00] border-t-transparent animate-spin" />
            <h2 className="text-lg font-bold text-[#1A3A6B]">Loading Google Sign-in…</h2>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
