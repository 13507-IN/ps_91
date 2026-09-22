'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, CheckCircle2, Volume2, Globe, ArrowRight } from 'lucide-react';
import { useTranslation, type Lang } from '@/lib/i18n/useTranslation';

const ONBOARDED_KEY = 'arthsetu_onboarded_v1';

/**
 * Centrally configurable Intro Video links for each language.
 * The user can update `videoUrl` with a YouTube URL, Vimeo URL, or direct MP4/WebM video URL.
 */
export const INTRO_VIDEO_CONFIG: Record<Lang, {
  title: string;
  description: string;
  videoUrl: string; // Add your video links here! e.g. "https://www.youtube.com/embed/..." or "/intro-en.mp4"
  duration: string;
}> = {
  EN: {
    title: 'Welcome to ArthSetu — Platform Walkthrough',
    description: 'Discover how ArthSetu transforms your rural enterprise idea into a bank-approved feasibility report and matches 10:90 concessional government schemes.',
    videoUrl: '/intro-en.mp4',
    duration: '2:15 min',
  },
  HI: {
    title: 'अर्थसेतु में आपका स्वागत है — परिचयात्मक वीडियो',
    description: 'जानिए कैसे अर्थसेतु आपके ग्रामीण व्यापार विचार को बैंक-स्वीकृत व्यवहार्यता रिपोर्ट में बदलता है और 10:90 रियायती सरकारी योजनाएं प्रदान करता है।',
    videoUrl: '/intro-hi.mp4',
    duration: '2:15 min',
  },
  BN: {
    title: 'অর্থসেতুতে আপনাকে স্বাগতম — পরিচিতি ও ব্যবহারের নির্দেশিকা',
    description: 'জানুন কীভাবে অর্থসেতু আপনার গ্রামীণ ব্যবসার পরিকল্পনাকে ব্যাংক-অনুমোদিত সম্ভাব্যতা রিপোর্টে রূপান্তর করে এবং ১০:৯০ সরকারি ঋণ সুবিধা প্রদান করে।',
    videoUrl: '/intro-bn.mp4',
    duration: '2:15 min',
  },
};

function formatVideoEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  return url;
}

type OnboardingStage = 'LOADER' | 'LANG_SELECT' | 'VIDEO';

export default function FirstTimeOnboardingModal() {
  const { lang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<OnboardingStage>('LOADER');
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [isPlayingMockVideo, setIsPlayingMockVideo] = useState(false);

  useEffect(() => {
    // Check if user is first-time visitor
    try {
      const hasOnboarded = localStorage.getItem(ONBOARDED_KEY);
      if (!hasOnboarded) {
        setIsOpen(true);
        setStage('LOADER');
      }
    } catch {
      // localStorage disabled - do not block
    }

    // Allow manual replay from header / footer
    const handleReplay = () => {
      setIsOpen(true);
      setStage('VIDEO');
    };
    window.addEventListener('open-arthsetu-intro', handleReplay);
    return () => window.removeEventListener('open-arthsetu-intro', handleReplay);
  }, []);

  // Animate the initial Logo Loader
  useEffect(() => {
    if (!isOpen || stage !== 'LOADER') return;

    const interval = setInterval(() => {
      setLoaderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('LANG_SELECT');
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isOpen, stage]);

  const handleLanguageSelect = (selectedLang: Lang) => {
    setLang(selectedLang);
    setStage('VIDEO');
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentVideo = INTRO_VIDEO_CONFIG[lang] || INTRO_VIDEO_CONFIG.EN;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top Decorative Tricolor Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E65C00] via-white to-[#0B7A4B]" />

        <AnimatePresence mode="wait">
          {/* ════════════════════════════════════════════════════════════════════════
              PHASE 1: ANIMATED LOGO LOADER
             ════════════════════════════════════════════════════════════════════════ */}
          {stage === 'LOADER' && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6"
            >
              {/* Pulsing Logo Container */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                <div className="relative w-28 h-28 rounded-full border-4 border-emerald-600/30 bg-white p-2 shadow-xl flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="ArthSetu Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>

              {/* Title & Trilingual Tagline */}
              <div className="space-y-1">
                <div className="text-[#E65C00] text-xs sm:text-sm font-black tracking-widest uppercase">
                  अर्थसेतु • ArthSetu • অর্থসেতু
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Rural Enterprise Intelligence
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  AI-Powered Feasibility Reports, Local Market Analytics & 10:90 Concessional Credit Schemes.
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-64 space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-150"
                    style={{ width: `${loaderProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>Loading Platform Assets...</span>
                  <span className="font-mono">{loaderProgress}%</span>
                </div>
              </div>

              {/* Skip to Language Button */}
              <button
                type="button"
                onClick={() => setStage('LANG_SELECT')}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors flex items-center gap-1 pt-2"
              >
                Skip intro <ArrowRight size={13} />
              </button>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              PHASE 2: TRILINGUAL LANGUAGE SELECTOR
             ════════════════════════════════════════════════════════════════════════ */}
          {stage === 'LANG_SELECT' && (
            <motion.div
              key="lang_select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 text-center space-y-6"
            >
              {/* Compact Logo Mark */}
              <div className="mx-auto w-16 h-16 rounded-full border-2 border-emerald-600/30 bg-white p-1 shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="ArthSetu Logo" className="w-full h-full object-contain rounded-full" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                  <Globe size={13} /> Select Your Preferred Language
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  अपनी भाषा चुनें • ভাষা বেছে নিন
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Choose your language to personalize reports, audio explanations, and video guidance.
                </p>
              </div>

              {/* 3 Interactive Language Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. English */}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('EN')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-32 ${
                    lang === 'EN'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🇮🇳</span>
                    {lang === 'EN' && <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                  <div>
                    <strong className="block text-base font-extrabold text-slate-900">English</strong>
                    <span className="text-xs text-slate-500">English (India)</span>
                  </div>
                </button>

                {/* 2. Hindi */}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('HI')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-32 ${
                    lang === 'HI'
                      ? 'border-[#E65C00] bg-amber-50/60 shadow-md ring-2 ring-[#E65C00]/20'
                      : 'border-slate-200 bg-white hover:border-[#E65C00]/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#E65C00]">हि</span>
                    {lang === 'HI' && <CheckCircle2 size={16} className="text-[#E65C00]" />}
                  </div>
                  <div>
                    <strong className="block text-base font-extrabold text-slate-900">हिन्दी</strong>
                    <span className="text-xs text-slate-500">हिन्दी (भारत)</span>
                  </div>
                </button>

                {/* 3. Bengali */}
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('BN')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-32 ${
                    lang === 'BN'
                      ? 'border-teal-700 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-teal-800">বা</span>
                    {lang === 'BN' && <CheckCircle2 size={16} className="text-teal-700" />}
                  </div>
                  <div>
                    <strong className="block text-base font-extrabold text-slate-900">বাংলা</strong>
                    <span className="text-xs text-slate-500">বাংলা (পশ্চিমবঙ্গ)</span>
                  </div>
                </button>
              </div>

              {/* Bottom hint */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>You can switch language anytime in the top header.</span>
                <button
                  type="button"
                  onClick={() => setStage('VIDEO')}
                  className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  Next <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              PHASE 3: INTRO VIDEO (LANGUAGE SPECIFIC) WITH SKIP BUTTON
             ════════════════════════════════════════════════════════════════════════ */}
          {stage === 'VIDEO' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 space-y-4"
            >
              {/* Header with Language badge & Skip button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-emerald-600/30 bg-white p-0.5 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="ArthSetu Logo" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {lang === 'BN' ? 'বাংলা পরিচিতি' : lang === 'HI' ? 'हिन्दी परिचय' : 'English Overview'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                      {currentVideo.title}
                    </h3>
                  </div>
                </div>

                {/* Top Skip Button */}
                <button
                  type="button"
                  onClick={handleComplete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
                >
                  <SkipForward size={14} />
                  <span>{lang === 'BN' ? 'স্কিপ করুন' : lang === 'HI' ? 'स्किप करें' : 'Skip Intro'}</span>
                </button>
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                {currentVideo.videoUrl ? (
                  // Embed iframe (YouTube/Vimeo) or HTML5 Video
                  currentVideo.videoUrl.includes('youtube.com') || currentVideo.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={formatVideoEmbedUrl(currentVideo.videoUrl)}
                      title={currentVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentVideo.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  )
                ) : (
                  // Mockup / Preview Player until user supplies video links
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0,transparent_70%)]" />

                    {/* Central Play Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsPlayingMockVideo(!isPlayingMockVideo)}
                      className="relative z-10 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 group mb-3"
                    >
                      <Play size={24} className="ml-1 fill-current" />
                    </button>

                    <div className="relative z-10 space-y-1 max-w-md">
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-white/10 mb-1">
                        Duration: {currentVideo.duration} • High Definition
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {currentVideo.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {currentVideo.description}
                      </p>
                    </div>

                    {/* Audio Equalizer Simulation */}
                    <div className="relative z-10 flex items-center gap-1 mt-4">
                      <Volume2 size={14} className="text-emerald-400 mr-1" />
                      <div className="flex items-end gap-1 h-3">
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">
                        {isPlayingMockVideo ? 'Playing Demo Audio...' : 'Audio Ready'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 text-[10px] text-slate-400">
                      Configure your official video link inside <code className="text-emerald-400">INTRO_VIDEO_CONFIG</code>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('LANG_SELECT')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                >
                  ← {lang === 'BN' ? 'ভাষা পরিবর্তন করুন' : lang === 'HI' ? 'भाषा बदलें' : 'Change Language'}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{lang === 'BN' ? 'শুরু করুন' : lang === 'HI' ? 'शुरू करें' : 'Get Started'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
