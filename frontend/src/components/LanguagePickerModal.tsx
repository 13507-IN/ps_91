'use client';

import React, { useEffect, useState } from 'react';

const LANG_KEY = 'ArthSetu_lang';

type Lang = 'EN' | 'BN';

export default function LanguagePickerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show only if user hasn't picked a language before
    try {
      if (!localStorage.getItem(LANG_KEY)) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — skip the modal
    }
  }, []);

  const pick = (lang: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0B3D3A]/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header stripe */}
        <div className="tricolor-divider w-full" />

        <div className="p-8 text-center">
          {/* Logo mark */}
          <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#1A3A6B] flex items-center justify-center mb-5 bg-white shadow-sm">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="18" stroke="#1A3A6B" strokeWidth="1.5" fill="none" />
              <circle cx="20" cy="20" r="12" stroke="#E65C00" strokeWidth="1" fill="none" />
              <circle cx="20" cy="20" r="3" fill="#1A3A6B" />
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const x1 = 20 + 5 * Math.cos(angle);
                const y1 = 20 + 5 * Math.sin(angle);
                const x2 = 20 + 11 * Math.cos(angle);
                const y2 = 20 + 11 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1A3A6B" strokeWidth="1" />;
              })}
            </svg>
          </div>

          <div className="text-[#E65C00] text-xs font-bold uppercase tracking-widest mb-1">ArthSetu</div>
          <h2 id="lang-modal-title" className="text-xl font-bold text-[#1A3A6B] mb-1">
            ArthSetu
          </h2>

          <p className="text-[#1A3A6B] font-semibold mt-4 mb-1">Choose Language / ভাষা বেছে নিন</p>
          <p className="text-sm text-[#718096] mb-7">
            Select your preferred language to continue
            <br />
            <span className="text-xs">চালিয়ে যেতে আপনার পছন্দের ভাষা বেছে নিন</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* English */}
            <button
              onClick={() => pick('EN')}
              className="flex-1 flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 border-[#1A3A6B] hover:bg-[#1A3A6B] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E65C00]"
            >
              <span className="text-2xl" aria-hidden="true">🇮🇳</span>
              <span className="font-bold text-base">English</span>
              <span className="text-xs opacity-70">Continue in English</span>
            </button>

            {/* Bengali */}
            <button
              onClick={() => pick('BN')}
              className="flex-1 flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 border-[#E65C00] hover:bg-[#E65C00] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3A6B]"
            >
              <span className="text-2xl" aria-hidden="true">বা</span>
              <span className="font-bold text-base">বাংলা</span>
              <span className="text-xs opacity-70">বাংলায় চালিয়ে যান</span>
            </button>
          </div>

          <p className="mt-5 text-xs text-[#718096]">
            You can change this anytime from the top menu.
            <br />
            আপনি যেকোনো সময় উপরের মেনু থেকে পরিবর্তন করতে পারবেন।
          </p>
        </div>

        <div className="tricolor-divider w-full" />
      </div>
    </div>
  );
}
