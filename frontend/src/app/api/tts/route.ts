import { NextRequest, NextResponse } from 'next/server';

// ─── Provider Configuration ───────────────────────────────────────
// Sarvam AI: Specialized Indic AI (Bengali, Hindi, Tamil, Telugu, etc.)
const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const DEFAULT_SARVAM_MODEL = process.env.SARVAM_MODEL || 'bulbul:v3';

// ElevenLabs: Multilingual voice synthesis (optional fallback)
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

interface SarvamTtsResponse {
  request_id?: string;
  audios?: string[];
  error?: string | { message?: string };
  message?: string;
  detail?: string | Array<{ msg?: string }>;
}


/**
 * Detect language code and optimal Sarvam speaker based on script and requested language
 */
function resolveLanguageAndSpeaker(text: string, requestedLang?: string): { languageCode: string; speaker: string } {
  const norm = (requestedLang || '').trim().toUpperCase();

  // Custom speaker from environment if user set SARVAM_SPEAKER
  const envSpeaker = process.env.SARVAM_SPEAKER?.trim().toLowerCase();

  // Bengali detection: Unicode \u0980-\u09FF or explicit BN code
  if (/[\u0980-\u09FF]/.test(text) || norm === 'BN' || norm === 'BEN' || norm === 'BENGALI') {
    return {
      languageCode: 'bn-IN',
      speaker: envSpeaker || 'rehan', // 'rehan', 'roopa', or 'suhani' (recommended for Bengali by Sarvam)
    };
  }

  // Hindi detection: Unicode \u0900-\u097F or explicit HI code
  if (/[\u0900-\u097F]/.test(text) || norm === 'HI' || norm === 'HIN' || norm === 'HINDI') {
    return {
      languageCode: 'hi-IN',
      speaker: envSpeaker || 'shubh', // 'shubh', 'ritu', 'aditya', 'priya'
    };
  }

  // Default: Indian English
  return {
    languageCode: 'en-IN',
    speaker: envSpeaker || 'shubh',
  };
}

/**
 * Inspect magic bytes of decoded audio buffer to set correct MIME type
 */
function detectAudioMimeType(buffer: Buffer): string {
  if (buffer.length >= 4) {
    // 'RIFF' header indicates WAV
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'audio/wav';
    }
    // ID3 or MPEG sync word indicates MP3
    if (
      (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
    ) {
      return 'audio/mpeg';
    }
  }
  return 'audio/wav';
}

/**
 * Call Sarvam AI Text-to-Speech API
 */
async function callSarvamTts(
  apiKey: string,
  text: string,
  languageCode: string,
  speaker: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const model = DEFAULT_SARVAM_MODEL;

  // Primary payload for bulbul:v3
  const v3Payload = {
    text,
    language_code: languageCode,
    speaker,
    model,
  };

  let response = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(v3Payload),
  });

  // If 400 or 422, try legacy bulbul:v1 schema payload as fallback
  if (!response.ok && (response.status === 400 || response.status === 422)) {
    console.warn(`[Sarvam TTS] bulbul:v3 returned ${response.status}. Retrying with legacy bulbul:v1 schema...`);
    const v1Payload = {
      inputs: [text],
      target_language_code: languageCode,
      speaker,
      model: 'bulbul:v1',
    };

    const v1Response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(v1Payload),
    });

    if (v1Response.ok) {
      response = v1Response;
    }
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error(`[Sarvam TTS] API error (${response.status}):`, errText);
    return null;
  }

  const data = (await response.json()) as SarvamTtsResponse;
  const base64Audio = data.audios?.[0];

  if (!base64Audio) {
    console.error('[Sarvam TTS] Empty audios array in response:', data);
    return null;
  }

  const audioBuffer = Buffer.from(base64Audio, 'base64');
  const mimeType = detectAudioMimeType(audioBuffer);

  return { buffer: audioBuffer, mimeType };
}

/**
 * Call ElevenLabs Text-to-Speech API (fallback)
 */
async function callElevenLabsTts(
  apiKey: string,
  text: string,
  customVoiceId?: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const voiceId = customVoiceId || DEFAULT_ELEVENLABS_VOICE_ID;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error(`[ElevenLabs TTS] API error (${response.status}):`, errText);
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { buffer, mimeType: 'audio/mpeg' };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      text?: string;
      lang?: string;
      voiceId?: string;
      speaker?: string;
    };
    const { text, lang, voiceId: customVoiceId, speaker: customSpeaker } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'INVALID_TEXT', message: 'Text is required for speech synthesis' },
        { status: 400 }
      );
    }

    // Limit text to 2,400 characters (Sarvam limit is 2,500 chars)
    const sanitizedText = text.trim().slice(0, 2400);

    // Resolve API keys (prioritizing Sarvam AI for natural Indic pronunciation)
    const sarvamApiKey =
      req.headers.get('x-sarvam-key') ||
      process.env.SARVAM_API_KEY;

    const elevenLabsApiKey =
      req.headers.get('x-elevenlabs-key') ||
      process.env.ELEVENLABS_API_KEY;

    // 1. Try Sarvam AI first
    if (sarvamApiKey) {
      const { languageCode, speaker } = resolveLanguageAndSpeaker(sanitizedText, lang);
      const selectedSpeaker = customSpeaker || speaker;

      const sarvamResult = await callSarvamTts(sarvamApiKey, sanitizedText, languageCode, selectedSpeaker);
      if (sarvamResult) {
        return new NextResponse(new Uint8Array(sarvamResult.buffer), {
          status: 200,
          headers: {
            'Content-Type': sarvamResult.mimeType,
            'Content-Length': sarvamResult.buffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'x-tts-provider': 'sarvam',
            'x-tts-language': languageCode,
            'x-tts-speaker': selectedSpeaker,
          },
        });
      }
    }

    // 2. Fallback to ElevenLabs if configured
    if (elevenLabsApiKey) {
      const elevenResult = await callElevenLabsTts(elevenLabsApiKey, sanitizedText, customVoiceId);
      if (elevenResult) {
        return new NextResponse(new Uint8Array(elevenResult.buffer), {
          status: 200,
          headers: {
            'Content-Type': elevenResult.mimeType,
            'Content-Length': elevenResult.buffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'x-tts-provider': 'elevenlabs',
          },
        });
      }
    }

    // 3. Neither API key is valid or both failed
    if (!sarvamApiKey && !elevenLabsApiKey) {
      return NextResponse.json(
        {
          error: 'NO_API_KEY',
          message:
            'No TTS API key configured. Set SARVAM_API_KEY in frontend/.env to enable natural Sarvam AI Indic speech narration.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'TTS_SYNTHESIS_FAILED',
        message: 'Speech synthesis provider failed. Falling back to browser speech synthesis.',
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to synthesize speech';
    console.error('[TTS Route] Internal server error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: errorMsg },
      { status: 500 }
    );
  }
}

// Support GET for checking active TTS provider status
export async function GET() {
  const hasSarvam = Boolean(process.env.SARVAM_API_KEY);
  const hasElevenLabs = Boolean(process.env.ELEVENLABS_API_KEY);

  return NextResponse.json({
    status: 'ok',
    primaryProvider: hasSarvam ? 'sarvam' : hasElevenLabs ? 'elevenlabs' : 'browser',
    sarvamConfigured: hasSarvam,
    sarvamModel: DEFAULT_SARVAM_MODEL,
    elevenlabsConfigured: hasElevenLabs,
  });
}
