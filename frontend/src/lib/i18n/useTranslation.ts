'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTranslations, LANG_KEY, type Lang } from './translations';

/**
 * Hook to access the current language and translation strings.
 *
 * Usage:
 *   const { t, lang, setLang } = useTranslation();
 *   <h1>{t.common.appName}</h1>
 */
export function useTranslation() {
  const [lang, setLangState] = useState<Lang>('EN');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY) as Lang | null;
      if (stored === 'EN' || stored === 'BN') {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable
    }

    // Listen for changes from other components / tabs
    function onStorage(e: StorageEvent) {
      if (e.key === LANG_KEY && (e.newValue === 'EN' || e.newValue === 'BN')) {
        setLangState(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);

    // Also listen for a custom event so same-tab changes propagate
    function onLangChange(e: Event) {
      const detail = (e as CustomEvent<Lang>).detail;
      if (detail === 'EN' || detail === 'BN') setLangState(detail);
    }
    window.addEventListener('udyamsetu-lang-change', onLangChange);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('udyamsetu-lang-change', onLangChange);
    };
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch {
      // ignore
    }
    // Dispatch custom event so all hooks in the same tab update
    window.dispatchEvent(new CustomEvent('udyamsetu-lang-change', { detail: newLang }));
  }, []);

  const t = getTranslations(lang);

  return { t, lang, setLang } as const;
}

export type { Lang };
