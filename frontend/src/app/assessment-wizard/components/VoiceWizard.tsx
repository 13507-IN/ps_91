'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight } from 'lucide-react';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '@/lib/voice/speechRecognition';
import { autoClassifyCategory } from '@/lib/ai/classifyCategory';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { WizardDraft } from '@/types';

interface VoiceWizardProps {
  draft: WizardDraft;
  updateDraft: (patch: Partial<WizardDraft>) => void;
  onSwitchToForm: () => void;
  onComplete: () => void;
}

interface QuestionStep {
  id: number;
  question: string;
  field: 'village' | 'idea' | 'capital';
  hint: string;
}

const QUESTIONS: QuestionStep[] = [
  {
    id: 1,
    question: 'Which village or town do you want to start your business in?',
    field: 'village',
    hint: 'e.g., "Krishnanagar Rural" or "Santipur"',
  },
  {
    id: 2,
    question: 'What business idea or product are you planning?',
    field: 'idea',
    hint: 'e.g., "I want to start a small dairy chilling unit" or "Mustard oil expeller"',
  },
  {
    id: 3,
    question: 'How much money (own capital) do you have to invest?',
    field: 'capital',
    hint: 'e.g., "50 thousand rupees" or "1 lakh"',
  },
];

export function VoiceWizard({ draft, updateDraft, onSwitchToForm, onComplete }: VoiceWizardProps) {
  const { lang } = useTranslation();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  const currentQ = QUESTIONS[currentQIndex];

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  function getLangCode(lang: string): string {
    const l = lang.toLowerCase();
    if (l === 'hi') return 'hi-IN';
    if (l === 'bn') return 'bn-IN';
    return 'en-IN';
  }

  function startListening() {
    if (!supported) return;

    setTranscript('');
    const recognizer = new SpeechRecognizer({
      language: getLangCode(lang),
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
          processAnswer(text);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsListening(true);
  }

  function stopListening() {
    recognizerRef.current?.stop();
    setIsListening(false);
    if (transcript) {
      processAnswer(transcript);
    }
  }

  function processAnswer(text: string) {
    if (!text.trim()) return;

    if (currentQ.field === 'village') {
      updateDraft({
        villageName: text.trim(),
        latitude: 23.4015,
        longitude: 88.5012,
        district: 'Nadia',
        state: 'West Bengal',
      });
    } else if (currentQ.field === 'idea') {
      const detectedCat = autoClassifyCategory(text.trim());
      updateDraft({
        businessIdea: text.trim(),
        ...(detectedCat ? { businessCategory: detectedCat } : {}),
      });
    } else if (currentQ.field === 'capital') {
      // Extract numbers or text like "1 lakh" / "50 thousand"
      let parsedAmount = 50000;
      const lower = text.toLowerCase();
      if (lower.includes('lakh') || lower.includes('lac')) {
        const match = text.match(/(\d+(\.\d+)?)/);
        const num = match ? parseFloat(match[0]) : 1;
        parsedAmount = num * 100000;
      } else if (lower.includes('thousand') || lower.includes('hazar')) {
        const match = text.match(/(\d+)/);
        const num = match ? parseInt(match[0], 10) : 50;
        parsedAmount = num * 1000;
      } else {
        const match = text.match(/(\d+)/);
        if (match) parsedAmount = parseInt(match[0], 10);
      }
      updateDraft({ availableCapital: parsedAmount });
    }

    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex((i) => i + 1);
      setTranscript('');
    } else {
      onComplete();
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
        <Sparkles size={14} className="text-teal-600" />
        Voice-First Assessment Assistant
      </div>

      {/* Question Card */}
      <div className="space-y-2 py-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Question {currentQ.id} of {QUESTIONS.length}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {currentQ.question}
        </h2>
        <p className="text-xs text-slate-500 italic">{currentQ.hint}</p>
      </div>

      {/* Big Animated Mic Button */}
      <div className="py-4 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
              : 'bg-gradient-to-tr from-teal-800 to-teal-700 text-white hover:shadow-2xl hover:scale-105'
          }`}
        >
          {isListening ? <MicOff size={36} /> : <Mic size={36} />}
        </button>

        <p className="text-xs font-semibold text-slate-600">
          {isListening ? 'Listening... Speak your answer now' : 'Tap microphone to speak'}
        </p>
      </div>

      {/* Real-time Transcription Feedback */}
      {transcript && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 font-medium text-sm">
          &ldquo;{transcript}&rdquo;
        </div>
      )}

      {/* Captured Values Checklist */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">1. Location</span>
          <span className="font-bold text-slate-800 truncate block">
            {draft.villageName || 'Pending...'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">2. Idea</span>
          <span className="font-bold text-slate-800 truncate block">
            {draft.businessIdea || 'Pending...'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">3. Capital</span>
          <span className="font-bold text-slate-800 truncate block">
            {draft.availableCapital ? `₹${draft.availableCapital}` : 'Pending...'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSwitchToForm}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Switch to Standard Form Mode
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentQIndex < QUESTIONS.length - 1) {
              setCurrentQIndex((i) => i + 1);
            } else {
              onComplete();
            }
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all"
        >
          <span>Next Step</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
