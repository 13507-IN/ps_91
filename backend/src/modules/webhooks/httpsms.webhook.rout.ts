import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { getEnv } from '../../config/env.js';

// ============================================================
// httpSMS Webhook Endpoint
//
// httpSMS POSTs CloudEvent payloads to this endpoint when
// message status changes (sent, delivered, failed, expired)
// or when inbound SMS / heartbeats occur.
//
// Docs: https://docs.httpsms.com/webhooks/introduction.md
// ============================================================

interface CloudEvent<T = unknown> {
  id: string;
  source: string;
  specversion: string;
  type: string;
  datacontenttype: string;
  time: string;
  data: T;
}

interface MessageEvent {
  contact: string;
  content?: string;
  id?: string;
  owner: string;
  request_id?: string | null;
  sim?: string;
  timestamp: string;
  user_id: string;
  error_message?: string;
}

interface FailedMessageEvent extends MessageEvent {
  error_message: string;
}

async function httpsmsWebhookRoutes(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  // Reject all requests if webhook secret is not configured
  if (!env.HTTPSMS_WEBHOOK_SECRET) {
    fastify.log.warn(
      '⚠️  HTTPSMS_WEBHOOK_SECRET not configured — webhook endpoint will return 503',
    );
  }

  fastify.post('/httpsms', async (request, reply) => {
    // ----------------------------------------------------------
    // 1. Verify JWT signature (Authorization: Bearer <token>)
    // ----------------------------------------------------------
    if (!env.HTTPSMS_WEBHOOK_SECRET) {
      return reply.status(503).send({
        status: 'error',
        message: 'Webhook secret not configured',
      });
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({
        status: 'error',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.slice(7);
    try {
      const decoded = verifyWebhookJwt(token, env.HTTPSMS_WEBHOOK_SECRET);
      if (!decoded) {
        return reply.status(401).send({ status: 'error', message: 'Invalid webhook signature' });
      }
    } catch {
      return reply.status(401).send({ status: 'error', message: 'Invalid webhook signature' });
    }

    // ----------------------------------------------------------
    // 2. Parse CloudEvent body
    // ----------------------------------------------------------
    const body = request.body as CloudEvent | undefined;
    if (!body?.type) {
      return reply.status(200).send({ status: 'ok' });
    }

    const eventType = body.type;
    const data = body.data as MessageEvent;

    // ----------------------------------------------------------
    // 3. Log event — always return 200 quickly (5s timeout)
    // ----------------------------------------------------------
    switch (eventType) {
      case 'message.phone.sent':
        fastify.log.info(
          {
            event: eventType,
            messageId: data.id,
            owner: data.owner,
            contact: data.contact,
            requestId: data.request_id,
            sim: data.sim,
          },
          '📱 httpSMS: message sent by phone',
        );
        break;

      case 'message.phone.delivered':
        fastify.log.info(
          {
            event: eventType,
            messageId: data.id,
            owner: data.owner,
            contact: data.contact,
            requestId: data.request_id,
          },
          '✅ httpSMS: message delivered to recipient',
        );
        break;

      case 'message.send.failed':
        fastify.log.warn(
          {
            event: eventType,
            messageId: data.id,
            owner: data.owner,
            contact: data.contact,
            requestId: data.request_id,
            error: (data as FailedMessageEvent).error_message,
          },
          '❌ httpSMS: message send failed',
        );
        break;

      case 'message.send.expired':
        fastify.log.warn(
          {
            event: eventType,
            messageId: data.id,
            owner: data.owner,
            contact: data.contact,
            requestId: data.request_id,
          },
          '⏰ httpSMS: message expired before send',
        );
        break;

      case 'message.phone.received':
        fastify.log.info(
          {
            event: eventType,
            messageId: data.id,
            owner: data.owner,
            contact: data.contact,
            contentLength: data.content?.length ?? 0,
          },
          '📨 httpSMS: inbound message received',
        );
        break;

      case 'phone.heartbeat.offline':
        fastify.log.warn(
          { event: eventType, owner: data.owner },
          '⚠️  httpSMS: phone went offline (no heartbeat for 1h)',
        );
        break;

      case 'phone.heartbeat.online':
        fastify.log.info(
          { event: eventType, owner: data.owner },
          '🟢 httpSMS: phone back online',
        );
        break;

      default:
        fastify.log.debug({ event: eventType }, 'httpSMS: unhandled webhook event');
    }

    return reply.status(200).send({ status: 'ok' });
  });
}

// ----------------------------------------------------------
// Minimal HS256 JWT verification (no external dependency needed)
// ----------------------------------------------------------

function verifyWebhookJwt(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];

  // Verify algorithm is HS256
  try {
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    if (header.alg !== 'HS256') return null;
  } catch {
    return null;
  }

  // Recompute HMAC-SHA256 signature
  const data = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
    return null;
  }

  // Decode payload
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export default httpsmsWebhookRoutes;
