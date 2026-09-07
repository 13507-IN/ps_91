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

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) || hasSession() }),
  setSession: (user) => set({ user, isAuthenticated: true }),
  logout: () => {
    setTokens(null);
    set({ user: null, isAuthenticated: false });
  },
}));

export { getRefreshToken };