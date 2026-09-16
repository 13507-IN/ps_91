import { create } from 'zustand';
import { getRefreshToken, hasSession, setTokens } from '@/lib/api/client';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  setSession: (user: UserProfile) => void;
  logout: () => void;
}

const PROFILE_KEY = 'ArthSetu_user_profile';

function getStoredProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_KEY) || window.localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredProfile(user: UserProfile | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      const json = JSON.stringify(user);
      window.sessionStorage.setItem(PROFILE_KEY, json);
      window.localStorage.setItem(PROFILE_KEY, json);
    } else {
      window.sessionStorage.removeItem(PROFILE_KEY);
      window.localStorage.removeItem(PROFILE_KEY);
    }
  } catch {
    // storage unavailable
  }
}

const initialProfile = getStoredProfile();

export const useAuthStore = create<AuthState>()((set) => ({
  user: initialProfile,
  isAuthenticated: Boolean(initialProfile) || (typeof window !== 'undefined' && hasSession()),
  setUser: (user) => {
    saveStoredProfile(user);
    set({ user, isAuthenticated: Boolean(user) || hasSession() });
  },
  setSession: (user) => {
    saveStoredProfile(user);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    saveStoredProfile(null);
    setTokens(null);
    set({ user: null, isAuthenticated: false });
  },
}));

export { getRefreshToken };