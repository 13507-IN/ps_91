'use client';

import React, { useEffect, useState } from 'react';

const LANG_KEY = 'udyamsetu_lang';

type Lang = 'EN' | 'BN';

const CONTENT = {
  EN: {
    title: 'Choose Your Language',
    subtitle: 'Select your preferred language to continue',
    btn: 'Continue in English',
    alt: 'বাংলায় চালিয়ে যান',
    altLang: 'BN' as Lang,
    note: 'You can change this later from the top menu.',
  },
  BN: {
    title: 'আপনার ভাষা বেছে নিন',
    subtitle: 'চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন',
    btn: 'বাংলায় চালিয়ে যান',
    alt: 'Continue in English',
    altLang: 'EN' as Lang,
    note: 'আপনি পরে উপরের মেনু থেকে এটি পরিবর্তন করতে পারেন।',
  },
};

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
          <div className="mx-auto w-14 h-14 rounded-xl bg-[#E98A15] flex items-center justify-center mb-5">
            <svg viewBox="0 0 40 40" width="32" height="32" fill="none" aria-hidden="true">
              <path
                d="M20 4 L34 10 L34 22 C34 30 20 36 20 36 C20 36 6 30 6 22 L6 10 Z"
                fill="#F5A832"
                stroke="#0B3D3A"
                strokeWidth="1"
              />
              <path d="M20 12 L26 18 L20 24 L14 18 Z" fill="#FAF8F3" />
              <rect x="6" y="26" width="28" height="3" fill="#0F7A4E" opacity="0.9" />
            </svg>
          </div>

          <h2 id="lang-modal-title" className="text-xl font-bold text-[#0B3D3A] mb-1">
            UdyamSetu AI
          </h2>

          <p className="text-[#0B3D3A] font-semibold mt-4 mb-1">Choose Language / ভাষা বেছে নিন</p>
          <p className="text-sm text-[#718096] mb-7">
            Select your preferred language to continue
            <br />
            <span className="text-xs">চালিয়ে যেতে আপনার পছন্দের ভাষা বেছে নিন</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* English */}
            <button
              onClick={() => pick('EN')}
              className="flex-1 flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 border-[#0B3D3A] hover:bg-[#0B3D3A] hover:text-white transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E98A15]"
            >
              <span className="text-2xl" aria-hidden="true">🇮🇳</span>
              <span className="font-bold text-base">English</span>
              <span className="text-xs opacity-70">Continue in English</span>
            </button>

            {/* Bengali */}
            <button
              onClick={() => pick('BN')}
              className="flex-1 flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 border-[#E98A15] hover:bg-[#E98A15] hover:text-white transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D3A]"
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
