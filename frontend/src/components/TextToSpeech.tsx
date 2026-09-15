'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export function TextToSpeech({ text, className = '' }: TextToSpeechProps) {
  const { lang } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function getVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const langCode = lang.toLowerCase();

    if (langCode === 'hi') {
      return voices.find((v) => v.lang.startsWith('hi')) || null;
    }
    if (langCode === 'bn') {
      return voices.find((v) => v.lang.startsWith('bn')) || null;
    }
    return voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en')) || null;
  }

  function handleTogglePlay() {
    if (!supported || !text) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoiceForLanguage(lang);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95; // Slightly slower for clarity in rural contexts

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }

  function handleStop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }

  if (!supported) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isPlaying
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
        }`}
        title={isPlaying ? 'Pause audio narration' : 'Listen in your language'}
      >
        {isPlaying ? (
          isPaused ? <Play size={14} /> : <Pause size={14} />
        ) : (
          <Volume2 size={14} />
        )}
        <span>{isPlaying ? (isPaused ? 'Resume' : 'Playing...') : 'Listen AI Report'}</span>
      </button>

      {isPlaying && (
        <button
          type="button"
          onClick={handleStop}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          title="Stop narration"
        >
          <VolumeX size={14} />
        </button>
      )}
    </div>
  );
}
