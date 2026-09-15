/**
 * ArthSetu — Web Speech Recognition Wrapper
 * Supports multi-language speech recognition for English, Hindi, and Bengali.
 */

export interface SpeechRecognitionOptions {
  language?: string; // 'en-IN' | 'hi-IN' | 'bn-IN'
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface SpeechRecognitionErrorEvent {
  error?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export class SpeechRecognizer {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening = false;

  constructor(private options: SpeechRecognitionOptions = {}) {
    if (typeof window === 'undefined') return;

    const w = window as SpeechRecognitionWindow;
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language ?? 'en-IN';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        options.onResult?.(text, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        options.onError?.(event.error || 'Speech recognition error');
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd?.();
      };
    }
  }

  setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  start() {
    if (!this.recognition || this.isListening) return;
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.warn('Speech recognition start error:', err);
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (err) {
      console.warn('Speech recognition stop error:', err);
    }
  }

  get listening(): boolean {
    return this.isListening;
  }
}
