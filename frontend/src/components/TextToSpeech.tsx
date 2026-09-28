'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Loader2, Sparkles, Settings2, Key, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface TextToSpeechProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
}

const PRESET_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', desc: 'Natural, warm & clear (Recommended)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', desc: 'Deep, confident narrator' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', desc: 'Friendly & expressive' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', desc: 'Clear & professional' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', desc: 'Authoritative British narrator' },
];

// In-memory cache to prevent re-fetching the same audio from ElevenLabs (saves character quota)
const audioUrlCache = new Map<string, string>();

export function TextToSpeech({ text, className = '' }: TextToSpeechProps) {
  const { lang } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceSource, setVoiceSource] = useState<'elevenlabs' | 'browser' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // ElevenLabs Key & Voice state
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('21m00Tcm4TlvDq8ikWAM');
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  const [keySavedToast, setKeySavedToast] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const browserSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('elevenlabs_api_key') || '';
      const savedVoice = localStorage.getItem('elevenlabs_voice_id') || '21m00Tcm4TlvDq8ikWAM';
      setCustomApiKey(savedKey);
      setSelectedVoiceId(savedVoice);

      // Check if server has an ELEVENLABS_API_KEY configured
      fetch('/api/tts')
        .then((res) => res.json())
        .then((data) => {
          setHasServerKey(Boolean(data?.elevenlabsConfigured));
        })
        .catch(() => {
          setHasServerKey(false);
        });
    }
  }, []);

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
      if (voiceSource === 'elevenlabs' && audioRef.current) {
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

    const cacheKey = `${selectedVoiceId}_${lang}_${text.trim().slice(0, 150)}`;
    const effectiveKey = customApiKey || '';

    // If we have a cached audio URL, play it directly
    if (audioUrlCache.has(cacheKey)) {
      const cachedUrl = audioUrlCache.get(cacheKey)!;
      playAudioUrl(cachedUrl);
      return;
    }

    setIsLoading(true);

    try {
      // Attempt ElevenLabs synthesis via Next.js API route
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (effectiveKey) {
        headers['x-elevenlabs-key'] = effectiveKey;
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          lang,
          voiceId: selectedVoiceId,
        }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const objectUrl = URL.createObjectURL(audioBlob);
        audioUrlCache.set(cacheKey, objectUrl);
        setIsLoading(false);
        playAudioUrl(objectUrl);
        return;
      }

      // If ElevenLabs returned 400 (no key configured) or other error, fallback to browser
      console.warn('[TextToSpeech] ElevenLabs API unavailable or unconfigured, falling back to Web Speech synthesis.');
      setIsLoading(false);
      playBrowserSpeech(text);
    } catch (err) {
      console.warn('[TextToSpeech] Failed to fetch ElevenLabs audio, falling back to browser speech:', err);
      setIsLoading(false);
      playBrowserSpeech(text);
    }
  }

  function playAudioUrl(url: string) {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = url;

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    audio.onerror = (e) => {
      console.error('[TextToSpeech] HTMLAudio error:', e);
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
        setVoiceSource('elevenlabs');
      })
      .catch((err) => {
        console.warn('[TextToSpeech] Audio play failed, falling back to browser:', err);
        playBrowserSpeech(text);
      });
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevenlabs_api_key', customApiKey.trim());
      localStorage.setItem('elevenlabs_voice_id', selectedVoiceId);
      // Clear cache when voice or key changes
      audioUrlCache.clear();
      setKeySavedToast(true);
      setTimeout(() => setKeySavedToast(false), 2500);
      setShowSettings(false);
    }
  }

  const isElevenLabsActive = Boolean(hasServerKey || customApiKey);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Main Play / Pause Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
          isPlaying
            ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30'
            : isElevenLabsActive
            ? 'bg-[#102347] text-white hover:bg-[#1A3A6B] active:scale-95 shadow-sm'
            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
        }`}
        title={
          isPlaying
            ? isPaused
              ? 'Resume audio'
              : 'Pause audio'
            : isElevenLabsActive
            ? 'Listen in Natural AI Voice (ElevenLabs)'
            : 'Listen in Standard Voice'
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
          <Volume2 size={14} className={isElevenLabsActive ? 'text-amber-300' : 'text-slate-600'} />
        )}

        <span>
          {isLoading
            ? 'Generating Natural AI Voice...'
            : isPlaying
            ? isPaused
              ? 'Resume'
              : 'Playing...'
            : 'Listen AI Summary'}
        </span>

        {isElevenLabsActive && !isPlaying && !isLoading && (
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
            <Sparkles size={10} />
            Natural
          </span>
        )}
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

      {/* Settings Gear to configure ElevenLabs API Key & Voice */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A3A6B] hover:bg-slate-100 transition-colors"
        title="Voice & ElevenLabs API Settings"
      >
        <Settings2 size={15} />
      </button>

      {/* Voice Settings Popover Modal */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Natural Voice Settings</h4>
                <p className="text-[10px] text-slate-500">Powered by ElevenLabs Multilingual v2</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3 mt-3">
            {/* Status indicator */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <span className="font-semibold text-slate-600">Voice Engine:</span>
              {isElevenLabsActive ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ElevenLabs Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Browser Fallback
                </span>
              )}
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>ElevenLabs API Key</span>
                {hasServerKey && (
                  <span className="text-[10px] text-emerald-600 font-semibold">(Configured on Server)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={hasServerKey ? 'Using server key (or enter custom key)' : 'sk_... (Paste ElevenLabs API key)'}
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] font-mono pr-8"
                />
                <Key size={13} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Keys are stored securely in your browser session or configured in <code className="text-slate-600">frontend/.env</code>.
              </p>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Voice</label>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] bg-white font-medium"
              >
                {PRESET_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#1A3A6B] hover:underline font-semibold"
              >
                Get ElevenLabs API Key ↗
              </a>

              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#1A3A6B] text-white text-xs font-bold hover:bg-[#152e55] transition-colors"
              >
                <Check size={12} />
                Save Preferences
              </button>
            </div>
          </form>

          {keySavedToast && (
            <div className="mt-2 text-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-1">
              ✓ Preferences saved successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
