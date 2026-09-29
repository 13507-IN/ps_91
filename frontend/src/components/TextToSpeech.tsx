'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface TextToSpeechProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
}

// In-memory cache to prevent re-fetching the same audio from Sarvam / ElevenLabs
const audioUrlCache = new Map<string, string>();

export function TextToSpeech({ text, className = '' }: TextToSpeechProps) {
  const { lang } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSource, setVoiceSource] = useState<'sarvam' | 'elevenlabs' | 'browser' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const browserSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
  }

  function getBrowserVoiceForLanguage(currentLang: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const langCode = currentLang.toLowerCase();

    if (langCode === 'hi') {
      return voices.find((v) => v.lang.startsWith('hi')) || null;
    }
    if (langCode === 'bn') {
      return voices.find((v) => v.lang.startsWith('bn')) || null;
    }
    return voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en')) || null;
  }

  function playBrowserSpeech(textToPlay: string) {
    if (!browserSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    const voice = getBrowserVoiceForLanguage(lang);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setVoiceSource('browser');
    setIsPlaying(true);
    setIsPaused(false);
  }

  async function handleTogglePlay() {
    if (!text) return;

    // If currently playing, toggle pause/play
    if (isPlaying) {
      if ((voiceSource === 'sarvam' || voiceSource === 'elevenlabs') && audioRef.current) {
        if (!isPaused) {
          audioRef.current.pause();
          setIsPaused(true);
        } else {
          audioRef.current.play();
          setIsPaused(false);
        }
        return;
      }

      if (voiceSource === 'browser' && browserSupported) {
        if (!isPaused) {
          window.speechSynthesis.pause();
          setIsPaused(true);
        } else {
          window.speechSynthesis.resume();
          setIsPaused(false);
        }
        return;
      }
    }

    // Stop any existing playback
    stopPlayback();

    const cacheKey = `${lang}_${text.trim().slice(0, 150)}`;

    // If we have a cached audio URL, play it directly
    if (audioUrlCache.has(cacheKey)) {
      const cachedUrl = audioUrlCache.get(cacheKey)!;
      playAudioUrl(cachedUrl, voiceSource === 'elevenlabs' ? 'elevenlabs' : 'sarvam');
      return;
    }

    setIsLoading(true);

    try {
      // Attempt natural Indic speech synthesis (Sarvam AI with ElevenLabs fallback)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          lang,
        }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const objectUrl = URL.createObjectURL(audioBlob);
        audioUrlCache.set(cacheKey, objectUrl);
        setIsLoading(false);
        const providerHeader = res.headers.get('x-tts-provider');
        const provider = providerHeader === 'elevenlabs' ? 'elevenlabs' : 'sarvam';
        playAudioUrl(objectUrl, provider);
        return;
      }

      // If server returned non-200 (e.g. key missing/rate limit), silently fallback to browser
      setIsLoading(false);
      playBrowserSpeech(text);
    } catch {
      // Fallback silently to browser speech
      setIsLoading(false);
      playBrowserSpeech(text);
    }
  }

  function playAudioUrl(url: string, provider: 'sarvam' | 'elevenlabs' = 'sarvam') {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = url;

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      // Fallback to browser
      playBrowserSpeech(text);
    };

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsPaused(false);
        setVoiceSource(provider);
      })
      .catch(() => {
        playBrowserSpeech(text);
      });
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Hidden audio element for Sarvam/ElevenLabs playback */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Main Play / Pause Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
          isPlaying
            ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30'
            : 'bg-[#102347] text-white hover:bg-[#1A3A6B] active:scale-95 shadow-sm'
        }`}
        title={
          isPlaying
            ? isPaused
              ? 'Resume audio'
              : 'Pause audio'
            : 'Listen AI Summary'
        }
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin text-amber-300" />
        ) : isPlaying ? (
          isPaused ? (
            <Play size={14} className="fill-current" />
          ) : (
            <Pause size={14} className="fill-current" />
          )
        ) : (
          <Volume2 size={14} className="text-amber-300" />
        )}

        <span>
          {isLoading
            ? 'Loading Voice...'
            : isPlaying
            ? isPaused
              ? 'Resume'
              : 'Playing...'
            : 'Listen AI Summary'}
        </span>
      </button>

      {/* Stop Button */}
      {isPlaying && (
        <button
          type="button"
          onClick={stopPlayback}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Stop narration"
        >
          <VolumeX size={15} />
        </button>
      )}
    </div>
  );
}
