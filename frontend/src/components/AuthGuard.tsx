'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, apiEndpoints, hasSession } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth';
import type { UserProfile } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect after login. Defaults to current path. */
  redirectTo?: string;
}

/**
 * Wraps any page/section that requires a valid session.
 * On mount it checks sessionStorage for an access token.
 * If absent, it bounces to /login?next=<current-path>.
 */
export default function AuthGuard({ children, redirectTo }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (hasSession()) {
        if (active) setAllowed(true);

        // If user profile is not yet in store, fetch it from backend
        if (!user) {
          try {
            const profile = await api<UserProfile>(apiEndpoints.users.me);
            if (active && profile) {
              setSession(profile);
            }
          } catch {
            // Keep session allowed if token is valid
          }
        }
        if (active) setChecking(false);
      } else {
        const next = redirectTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
        if (active) {
          setChecking(false);
          router.replace(`/login?next=${encodeURIComponent(next)}`);
        }
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [router, redirectTo, user, setSession]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#1A3A6B]">
          <Loader2 size={32} className="animate-spin text-[#E65C00]" />
          <p className="text-sm text-[#666]">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
