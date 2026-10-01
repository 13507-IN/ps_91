import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TelnyxService } from './telnyx.service.js';
import { sendTelnyxSms, isTelnyxConfigured } from '../../lib/telnyx.js';
import { getEnv } from '../../config/env.js';
import { z } from 'zod';

const simulateSmsSchema = z.object({
  phone: z.string().min(8, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
});

const sendSmsSchema = z.object({
  to: z.string().min(8, 'Recipient phone number is required'),
  text: z.string().min(1, 'Text content is required'),
});

const outboundCallSchema = z.object({
  phone: z.string().min(8, 'Phone number is required'),
});

export async function telnyxRoutes(fastify: FastifyInstance): Promise<void> {
  const telnyxService = new TelnyxService(fastify);
  const env = getEnv();

  // ============================================================
  // 1. TELNYX WEBHOOKS (Publicly called by Telnyx Voice & SMS)
  // ============================================================

  /**
   * Inbound SMS Webhook
   * Telnyx sends POST with event_type 'message.received'
   * Docs: https://developers.telnyx.com/api-reference/messaging/webhooks
   */
  fastify.post('/webhooks/telnyx/sms', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const raw = request.body as Record<string, unknown>;
      const data = (raw?.data || raw) as {
        event_type?: string;
        payload?: {
          from?: { phone_number?: string } | string;
          text?: string;
          to?: Array<{ phone_number?: string }> | string;
        };
      };

      const payload = data?.payload;
      let fromPhone = '';

      if (typeof payload?.from === 'object' && payload?.from !== null) {
        fromPhone = payload.from.phone_number || '';
      } else if (typeof payload?.from === 'string') {
        fromPhone = payload.from;
      }

      const text = payload?.text || '';

      if (!fromPhone || !text) {
        return reply.status(200).send({ status: 'ignored', message: 'No phone number or text in payload' });
      }

      // Generate conversational bot response
      const replyMessage = await telnyxService.handleInboundSms(fromPhone, text);

      // Send the SMS response back to the user via Telnyx
      if (isTelnyxConfigured()) {
        await sendTelnyxSms({
          to: fromPhone,
          text: replyMessage,
        });
      }

      return reply.status(200).send({
        status: 'success',
        to: fromPhone,
        reply: replyMessage,
      });
    } catch (err) {
      fastify.log.error(err, '❌ Error processing Telnyx inbound SMS webhook');
      return reply.status(200).send({ status: 'error', message: (err as Error).message });
    }
  });

  /**
   * Inbound Voice Call Webhook (TeXML)
   * Telnyx calls this endpoint when someone dials our Telnyx number
   */
  const handleVoiceCall = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = (request.query || {}) as Record<string, string>;
      const body = (request.body || {}) as Record<string, string>;

      const fromPhone = body.From || query.From || body.from || query.from || '+919999999999';
      const texmlResponse = await telnyxService.handleInboundCall(fromPhone);

      return reply
        .header('Content-Type', 'application/xml')
        .status(200)
        .send(texmlResponse);
    } catch (err) {
      fastify.log.error(err, '❌ Error generating Telnyx TeXML response');
      const fallbackXml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Response><Say language="en-IN">Welcome to ArthSetu. Please reply to our SMS to assess your business feasibility. Goodbye!</Say></Response>';
      return reply
        .header('Content-Type', 'application/xml')
        .status(200)
        .send(fallbackXml);
    }
  };

  fastify.get('/webhooks/telnyx/voice', handleVoiceCall);
  fastify.post('/webhooks/telnyx/voice', handleVoiceCall);

  /**
   * Inbound Voice Call Gather Digits Webhook (TeXML)
   * Receives DTMF keypress (1 or 2)
   */
  const handleVoiceGather = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = (request.query || {}) as Record<string, string>;
      const body = (request.body || {}) as Record<string, string>;

      const fromPhone = body.From || query.From || body.from || query.from || '+919999999999';
      const digits = body.Digits || query.Digits || body.digits || query.digits || '';

      const texmlResponse = await telnyxService.handleGatherDigits(fromPhone, digits);

      return reply
        .header('Content-Type', 'application/xml')
        .status(200)
        .send(texmlResponse);
    } catch (err) {
      fastify.log.error(err, '❌ Error processing Telnyx voice gather webhook');
      const fallbackXml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Response><Say language="en-IN">Thank you for calling ArthSetu. Goodbye!</Say></Response>';
      return reply
        .header('Content-Type', 'application/xml')
        .status(200)
        .send(fallbackXml);
    }
  };

  fastify.get('/webhooks/telnyx/voice/gather', handleVoiceGather);
  fastify.post('/webhooks/telnyx/voice/gather', handleVoiceGather);

  // ============================================================
  // 2. SIMULATION & API CONTROL ENDPOINTS (For Testing & Web App)
  // ============================================================

  /**
   * Simulate SMS Interaction
   * Test the complete conversational SMS flow without needing a real phone!
   * POST /api/telnyx/simulate-sms
   */
  fastify.post('/api/telnyx/simulate-sms', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = simulateSmsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0]?.message });
    }

    const replyMessage = await telnyxService.handleInboundSms(
      parsed.data.phone,
      parsed.data.message
    );

    return reply.status(200).send({
      phone: telnyxService.normalizePhone(parsed.data.phone),
      inputMessage: parsed.data.message,
      botReply: replyMessage,
    });
  });

  /**
   * Send arbitrary SMS message via Telnyx
   * POST /api/telnyx/send-sms
   */
  fastify.post('/api/telnyx/send-sms', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = sendSmsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0]?.message });
    }

    if (!isTelnyxConfigured()) {
      return reply.status(400).send({
        error: 'TELNYX_NOT_CONFIGURED',
        message: 'TELNYX_API_KEY and TELNYX_PHONE_NUMBER must be set in backend/.env',
      });
    }

    const result = await sendTelnyxSms({
      to: parsed.data.to,
      text: parsed.data.text,
    });

    return reply.status(200).send({
      status: 'sent',
      data: result.data,
    });
  });

  /**
   * Trigger outbound automated voice call to speak feasibility report
   * POST /api/telnyx/outbound-call
   */
  fastify.post('/api/telnyx/outbound-call', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = outboundCallSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0]?.message });
    }

    const result = await telnyxService.triggerVoiceCall(parsed.data.phone);
    return reply.status(result.success ? 200 : 400).send(result);
  });

  /**
   * Get Telnyx Configuration Status
   * GET /api/telnyx/status
   */
  fastify.get('/api/telnyx/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    const configured = isTelnyxConfigured();
    return reply.status(200).send({
      status: 'ok',
      configured,
      phoneNumber: env.TELNYX_PHONE_NUMBER ? `${env.TELNYX_PHONE_NUMBER.slice(0, 4)}****${env.TELNYX_PHONE_NUMBER.slice(-4)}` : null,
      hasApiKey: Boolean(env.TELNYX_API_KEY),
      hasMessagingProfile: Boolean(env.TELNYX_MESSAGING_PROFILE_ID),
      hasConnectionId: Boolean(env.TELNYX_CONNECTION_ID),
      webhooks: {
        sms: '/webhooks/telnyx/sms',
        voice: '/webhooks/telnyx/voice',
        voiceGather: '/webhooks/telnyx/voice/gather',
      },
    });
  });
}
