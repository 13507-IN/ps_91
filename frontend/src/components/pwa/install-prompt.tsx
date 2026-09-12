'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const handleBeforeInstall = useCallback((e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e as BeforeInstallPromptEvent);
    setTimeout(() => setVisible(true), 2500);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => setVisible(false));
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [handleBeforeInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-[100] w-80 rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95"
        >
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Image src="/logo.png" alt="ArthSetu AI" width={48} height={48} className="h-12 w-12 rounded-full border border-gray-200 object-contain dark:border-neutral-600" />
            <div>
              <h3 className="font-bold text-[#1A3A6B] dark:text-white">ArthSetu AI</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Business intelligence for entrepreneurs</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-600 dark:text-neutral-300">
            Install ArthSetu AI for quick access and offline support.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 rounded-lg bg-[#1A3A6B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#122a50] dark:bg-[#E65C00] dark:hover:bg-[#c54d00]"
            >
              Install App
            </button>
            <button
              onClick={() => setVisible(false)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}