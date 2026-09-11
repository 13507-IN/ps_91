'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Loader2, Volume2, Globe, AlertCircle, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { apiBaseUrl, apiEndpoints } from '@/lib/api/client';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  currentValue: string;
  autoRefine?: boolean;
}

type VoiceLang = 'bn-BD' | 'bn-IN' | 'en-IN';

export default function VoiceInput({ onTranscript, currentValue, autoRefine = true }: VoiceInputProps) {
  const { t, lang } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>(lang === 'BN' ? 'bn-BD' : 'en-IN');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [refinedBadge, setRefinedBadge] = useState(false);
  const [hasSpeechApi, setHasSpeechApi] = useState(true);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rawTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check if SpeechRecognition is available in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechApi(false);
    }
  }, []);

  // Update voice language default if global language changes
  useEffect(() => {
    if (lang === 'BN' && !voiceLang.startsWith('bn')) {
      setVoiceLang('bn-BD');
    } else if (lang === 'EN' && voiceLang !== 'en-IN') {
      setVoiceLang('en-IN');
    }
  }, [lang]);

  // Handle automatic AI accent & dialect refinement
  async function triggerAiRefinement(textToRefine: string) {
    if (!textToRefine || textToRefine.trim().length < 2) return;
    setIsProcessing(true);
    setStatusMessage(t.business.voiceProcessing);

    try {
      const targetUrl = `${apiBaseUrl}${apiEndpoints.ai.refineVoice}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: textToRefine,
          language: voiceLang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.refined_text) {
          onTranscript(data.refined_text);
          setRefinedBadge(true);
          setTimeout(() => setRefinedBadge(false), 5000);
        }
      }
    } catch (err) {
      console.warn('Voice AI refinement fallback:', err);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  }

  // Start browser speech recognition
  function startListening() {
    rawTranscriptRef.current = '';
    setStatusMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceLang;

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage(t.business.voiceListening);
        };

        recognition.onresult = (event: any) => {
          let interimText = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript + ' ';
            } else {
              interimText += event.results[i][0].transcript;
            }
          }

          const combined = (finalText + interimText).trim();
          if (combined) {
            rawTranscriptRef.current = combined;
            // Immediate live text update
            const updated = currentValue
              ? currentValue.trim() + ' ' + combined
              : combined;
            onTranscript(updated);
          }

          // Reset silence timer for automatic AI accent refinement on pause
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (rawTranscriptRef.current && autoRefine) {
              stopListening();
            }
          }, 2500);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setIsListening(false);
            setStatusMessage(t.business.voiceError);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const finalRaw = rawTranscriptRef.current;
          if (finalRaw && autoRefine) {
            triggerAiRefinement(finalRaw);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech API init failed, falling back to MediaRecorder:', err);
      }
    }

    // Fallback to MediaRecorder API
    startMediaRecorder();
  }

  // MediaRecorder Fallback
  async function startMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        setStatusMessage(t.business.voiceProcessing);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const targetUrl = `${apiBaseUrl}${apiEndpoints.ai.refineVoice}`;
            const res = await fetch(targetUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audio_base64: base64Audio,
                mime_type: 'audio/webm',
                language: voiceLang,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.refined_text) {
                const updated = currentValue
                  ? currentValue.trim() + ' ' + data.refined_text
                  : data.refined_text;
                onTranscript(updated);
                setRefinedBadge(true);
                setTimeout(() => setRefinedBadge(false), 5000);
              }
            }
          } catch (err) {
            console.error('Audio upload failed:', err);
          } finally {
            setIsProcessing(false);
            setStatusMessage(null);
          }
        };
      };

      mediaRecorder.start();
      setIsListening(true);
      setStatusMessage(t.business.voiceListening);
    } catch (err) {
      console.error('Mic access denied:', err);
      setStatusMessage(t.business.voiceError);
      setIsListening(false);
    }
  }

  function stopListening() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 my-2.5 p-2 rounded-xl bg-paper-dark border border-teal-900/10">
      <div className="flex items-center gap-2">
        {/* Main Microphone Action Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={isProcessing}
          className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400/50'
              : isProcessing
              ? 'bg-teal-700/20 text-teal-800 cursor-wait'
              : 'bg-teal-800 text-white hover:bg-teal-900 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin text-teal-700" />
              <span>{t.business.voiceProcessing}</span>
            </>
          ) : isListening ? (
            <>
              <MicOff size={14} />
              <span>{t.business.voiceStop}</span>
              {/* Sound wave pulse */}
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </>
          ) : (
            <>
              <Mic size={14} />
              <span>{t.business.voiceBtn}</span>
            </>
          )}
        </button>

        {/* Language selector toggle */}
        <div className="flex items-center bg-white border border-border rounded-lg p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setVoiceLang('bn-BD')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              voiceLang.startsWith('bn')
                ? 'bg-teal-900 text-white font-semibold shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            বাংলা (BD/IN)
          </button>
          <button
            type="button"
            onClick={() => setVoiceLang('en-IN')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              voiceLang === 'en-IN'
                ? 'bg-teal-900 text-white font-semibold shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Real-time Status / Badges */}
      <div className="flex items-center gap-2 text-xs">
        {isListening && (
          <span className="flex items-center gap-1.5 text-red-600 font-medium animate-pulse">
            <Volume2 size={13} />
            <span>{t.business.voiceListening}</span>
          </span>
        )}

        {refinedBadge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300/60 animate-fade-in">
            <Sparkles size={12} className="text-emerald-600" />
            <span>{t.business.voiceRefined}</span>
          </span>
        )}

        {statusMessage && !isListening && !refinedBadge && (
          <span className="text-ink-muted text-[11px] flex items-center gap-1">
            <Globe size={11} />
            <span>{statusMessage}</span>
          </span>
        )}
      </div>
    </div>
  );
}
