import { httpRequest } from './httpClient.js';
import { getEnv } from '../config/env.js';

// ============================================================
// httpSMS client — send SMS via the user's Android phone
// Docs: https://api.httpsms.com (Send an SMS message)
// ============================================================

const HTTPSMS_API_URL = 'https://api.httpsms.com/v1/messages/send';

export interface HttpsmsSendParams {
  /** The authenticated phone number (sender) registered on the httpSMS app. */
  from: string;
  /** Recipient phone number in E.164 format, e.g. +919876543210 */
  to: string;
  /** SMS body text. */
  content: string;
  /** Optional request ID for tracking — included in webhook event payloads. */
  requestId?: string;
}

interface HttpsmsSendResponse {
  status: string;
  message: string;
  data?: {
    id: string;
    from: string;
    to: string;
    content: string;
    status?: string;
  };
}

/**
 * Send an SMS through httpSMS. Throws HttpClientError on any non-2xx
 * response so callers never treat a failed request as successfully sent.
 */
export async function sendSms(params: HttpsmsSendParams): Promise<HttpsmsSendResponse> {
  const env = getEnv();

  if (!env.HTTPSMS_API_KEY) {
    throw new Error('HTTPSMS_API_KEY is not configured on the backend.');
  }

  const response = await httpRequest<HttpsmsSendResponse>(HTTPSMS_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.HTTPSMS_API_KEY,
    },
    body: {
      from: params.from,
      to: params.to,
      content: params.content,
      ...(params.requestId ? { request_id: params.requestId } : {}),
    },
    timeoutMs: 15000,
    retries: 1,
  });

  if (response?.status !== 'success') {
    throw new Error(`httpSMS rejected the message: ${response?.message ?? 'unknown error'}`);
  }

  return response;
}