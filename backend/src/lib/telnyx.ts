import { getEnv } from '../config/env.js';
import { httpRequest, HttpClientError } from './httpClient.js';

// ============================================================
// Telnyx Client — SMS & Voice/Call API
// Docs: https://developers.telnyx.com/api-reference/overview
// ============================================================

const TELNYX_MESSAGES_URL = 'https://api.telnyx.com/v2/messages';
const TELNYX_CALLS_URL = 'https://api.telnyx.com/v2/calls';

export interface TelnyxSendSmsParams {
  /** Recipient phone number in E.164 format, e.g. +919876543210 */
  to: string;
  /** Message text */
  text: string;
  /** Sender phone number (defaults to TELNYX_PHONE_NUMBER from env) */
  from?: string;
  /** Optional Telnyx Messaging Profile ID */
  messagingProfileId?: string;
}

export interface TelnyxSendSmsResponse {
  data: {
    id: string;
    record_type: string;
    direction: string;
    from: {
      phone_number: string;
    };
    to: Array<{
      phone_number: string;
      status: string;
    }>;
    text: string;
  };
}

export interface TelnyxMakeCallParams {
  /** Destination phone number in E.164 format */
  to: string;
  /** Caller ID phone number (defaults to TELNYX_PHONE_NUMBER) */
  from?: string;
  /** Voice application connection ID from Telnyx Portal */
  connectionId?: string;
  /** Webhook URL to receive call events */
  webhookUrl?: string;
  /** Custom client state / metadata */
  clientState?: string;
}

export interface TelnyxCallResponse {
  data: {
    call_control_id?: string;
    call_leg_id?: string;
    call_session_id?: string;
    is_alive?: boolean;
    record_type?: string;
  };
}

/**
 * Checks whether Telnyx credentials are fully configured in the environment
 */
export function isTelnyxConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.TELNYX_API_KEY && env.TELNYX_PHONE_NUMBER);
}

/**
 * Send an SMS message via Telnyx v2 API
 */
export async function sendTelnyxSms(params: TelnyxSendSmsParams): Promise<TelnyxSendSmsResponse> {
  const env = getEnv();

  if (!env.TELNYX_API_KEY) {
    throw new Error('TELNYX_API_KEY is not configured on the backend.');
  }

  const fromNumber = params.from || env.TELNYX_PHONE_NUMBER;
  if (!fromNumber && !params.messagingProfileId && !env.TELNYX_MESSAGING_PROFILE_ID) {
    throw new Error('TELNYX_PHONE_NUMBER or TELNYX_MESSAGING_PROFILE_ID is required to send SMS.');
  }

  const normalizedTo = params.to.startsWith('+') ? params.to : `+${params.to.replace(/\D/g, '')}`;
  const messagingProfileId = params.messagingProfileId || env.TELNYX_MESSAGING_PROFILE_ID;

  const bodyPayload: Record<string, unknown> = {
    to: normalizedTo,
    text: params.text,
  };

  if (fromNumber) {
    bodyPayload.from = fromNumber;
  }
  if (messagingProfileId) {
    bodyPayload.messaging_profile_id = messagingProfileId;
  }

  const response = await httpRequest<TelnyxSendSmsResponse>(TELNYX_MESSAGES_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: bodyPayload,
    timeoutMs: 15000,
    retries: 2,
  });

  return response;
}

/**
 * Initiate an outbound voice call via Telnyx Call Control v2
 */
export async function makeTelnyxCall(params: TelnyxMakeCallParams): Promise<TelnyxCallResponse> {
  const env = getEnv();

  if (!env.TELNYX_API_KEY) {
    throw new Error('TELNYX_API_KEY is not configured on the backend.');
  }

  const fromNumber = params.from || env.TELNYX_PHONE_NUMBER;
  const connectionId = params.connectionId || env.TELNYX_CONNECTION_ID;

  if (!fromNumber) {
    throw new Error('TELNYX_PHONE_NUMBER is required to make outbound calls.');
  }

  const normalizedTo = params.to.startsWith('+') ? params.to : `+${params.to.replace(/\D/g, '')}`;

  const bodyPayload: Record<string, unknown> = {
    to: normalizedTo,
    from: fromNumber,
    ...(connectionId ? { connection_id: connectionId } : {}),
    ...(params.webhookUrl ? { webhook_url: params.webhookUrl } : {}),
    ...(params.clientState ? { client_state: params.clientState } : {}),
  };

  const response = await httpRequest<TelnyxCallResponse>(TELNYX_CALLS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: bodyPayload,
    timeoutMs: 15000,
  });

  return response;
}

/**
 * Speak text inside an active Call Control call using Telnyx TTS
 */
export async function speakInCall(
  callControlId: string,
  params: {
    payload: string;
    voice?: string;
    language?: string;
  }
): Promise<void> {
  const env = getEnv();
  if (!env.TELNYX_API_KEY) return;

  const url = `${TELNYX_CALLS_URL}/${encodeURIComponent(callControlId)}/actions/speak`;

  await httpRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: {
      payload: params.payload,
      voice: params.voice || 'female',
      language: params.language || 'en-IN',
    },
    timeoutMs: 10000,
  }).catch((err) => {
    console.error(`[Telnyx Voice] Error speaking in call ${callControlId}:`, (err as Error).message);
  });
}

/**
 * Hang up an active Call Control call
 */
export async function hangupCall(callControlId: string): Promise<void> {
  const env = getEnv();
  if (!env.TELNYX_API_KEY) return;

  const url = `${TELNYX_CALLS_URL}/${encodeURIComponent(callControlId)}/actions/hangup`;

  await httpRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: {},
    timeoutMs: 8000,
  }).catch(() => {
    // ignore hangup errors if call already ended
  });
}
