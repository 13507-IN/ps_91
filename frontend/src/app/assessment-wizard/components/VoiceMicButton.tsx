'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '@/lib/voice/speechRecognition';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface VoiceMicButtonProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function VoiceMicButton({ onTranscription, className = '' }: VoiceMicButtonProps) {
  const { lang } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  function getLangCode(lang: string): string {
    const l = lang.toLowerCase();
    if (l === 'hi') return 'hi-IN';
    if (l === 'bn') return 'bn-IN';
    return 'en-IN';
  }

  function toggleListening() {
    if (!supported) return;

    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = new SpeechRecognizer({
      language: getLangCode(lang),
      onResult: (transcript, isFinal) => {
        if (transcript) {
          onTranscription(transcript);
        }
        if (isFinal) {
          setIsListening(false);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsListening(true);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
        isListening
          ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse shadow-sm'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200'
      } ${className}`}
      title={isListening ? 'Listening... Speak now' : 'Click to speak'}
    >
      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
    </button>
  );
}
