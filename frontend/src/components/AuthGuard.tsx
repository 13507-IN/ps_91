'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasSession } from '@/lib/api/client';
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

  useEffect(() => {
    if (hasSession()) {
      setAllowed(true);
      setChecking(false);
    } else {
      const next = redirectTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router, redirectTo]);

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
