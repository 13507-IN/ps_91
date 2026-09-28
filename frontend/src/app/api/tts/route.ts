import { NextRequest, NextResponse } from 'next/server';

// Default voice: '21m00Tcm4TlvDq8ikWAM' (Rachel - natural, clear, warm multilingual voice)
// Other excellent multilingual options: 'pNInz6obpgDQGcFmaJgB' (Adam), 'EXAVITQu4vr4xnSDxMaL' (Bella)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface ElevenLabsErrorResponse {
  detail?: {
    message?: string;
    status?: string;
  };
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      text?: string;
      lang?: string;
      voiceId?: string;
    };
    const { text, voiceId: customVoiceId } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'INVALID_TEXT', message: 'Text is required for speech synthesis' },
        { status: 400 }
      );
    }

    // Check for API key from environment or from client header (if user configured it in UI)
    const apiKey =
      req.headers.get('x-elevenlabs-key') ||
      process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'NO_API_KEY',
          message: 'ElevenLabs API key is not configured. Set ELEVENLABS_API_KEY in frontend/.env or provide it in the UI.',
        },
        { status: 400 }
      );
    }

    // Limit text to 4000 characters to prevent excessive token credit burn
    const sanitizedText = text.trim().slice(0, 4000);

    const voiceId = customVoiceId || DEFAULT_VOICE_ID;

    // Call ElevenLabs Text-to-Speech API
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
          text: sanitizedText,
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
      let parsedErr: ElevenLabsErrorResponse | null = null;
      try {
        parsedErr = JSON.parse(errText) as ElevenLabsErrorResponse;
      } catch {
        // raw text
      }

      console.error('[ElevenLabs TTS] API error response:', response.status, errText);

      return NextResponse.json(
        {
          error: 'ELEVENLABS_ERROR',
          status: response.status,
          message: parsedErr?.detail?.message || parsedErr?.message || 'ElevenLabs API request failed',
        },
        { status: response.status }
      );
    }

    // Stream the audio binary back to the client
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to synthesize speech';
    console.error('[ElevenLabs TTS] Internal server error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: errorMsg },
      { status: 500 }
    );
  }
}

// Support GET for testing if ElevenLabs is configured on the server
export async function GET() {
  const hasServerKey = Boolean(process.env.ELEVENLABS_API_KEY);
  return NextResponse.json({
    status: 'ok',
    elevenlabsConfigured: hasServerKey,
    defaultVoiceId: DEFAULT_VOICE_ID,
    model: 'eleven_multilingual_v2',
  });
}
