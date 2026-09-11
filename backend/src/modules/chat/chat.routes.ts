import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chat, clearSession, isGeminiConfigured } from './chat.service.js';
import { randomUUID } from 'crypto';

// ============================================================
// Chat Routes — POST /api/chat/message (SSE streaming)
// ============================================================

export async function chatRoutes(fastify: FastifyInstance) {

  /**
   * POST /message — Send a message and receive a streamed response
   */
  fastify.post<{
    Body: {
      message: string;
      sessionId?: string;
      reportContext?: {
        businessCategory?: string;
        viabilityScore?: number;
        grade?: string;
        strengths?: string[];
        weaknesses?: string[];
        decision?: string;
        summary?: string;
      };
    };
  }>(
    '/message',
    {
      schema: {
        tags: ['Chat'],
        summary: 'Send a chat message and receive a streaming AI response',
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 2000 },
            sessionId: { type: 'string' },
            reportContext: {
              type: 'object',
              properties: {
                businessCategory: { type: 'string' },
                viabilityScore: { type: 'number' },
                grade: { type: 'string' },
                strengths: { type: 'array', items: { type: 'string' } },
                weaknesses: { type: 'array', items: { type: 'string' } },
                decision: { type: 'string' },
                summary: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { message, sessionId: clientSessionId, reportContext } = request.body;
      const sessionId = clientSessionId || randomUUID();
      const userId = (request.user as { sub?: string })?.sub;

      // Build user context from profile
      let userContext: Parameters<typeof chat>[2] = undefined;
      if (userId) {
        try {
          const user = await fastify.prisma.user.findUnique({
            where: { id: userId },
          });
          if (user) {
            let age: number | undefined;
            if (user.dateOfBirth) {
              const dob = new Date(user.dateOfBirth);
              const today = new Date();
              age = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
            }

            let reportSummary: string | null = null;
            if (reportContext) {
              const parts: string[] = [];
              if (reportContext.businessCategory) parts.push(`Business: ${reportContext.businessCategory}`);
              if (reportContext.viabilityScore !== undefined) parts.push(`Viability Score: ${reportContext.viabilityScore}/100`);
              if (reportContext.grade) parts.push(`Grade: ${reportContext.grade}`);
              if (reportContext.decision) parts.push(`Decision: ${reportContext.decision}`);
              if (reportContext.summary) parts.push(`Summary: ${reportContext.summary}`);
              if (reportContext.strengths?.length) parts.push(`Strengths: ${reportContext.strengths.join(', ')}`);
              if (reportContext.weaknesses?.length) parts.push(`Weaknesses: ${reportContext.weaknesses.join(', ')}`);
              if (parts.length > 0) reportSummary = parts.join('\n');
            } else {
              // Auto-fetch latest report
              const latestReport = await fastify.prisma.analysis.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                  businessCategory: true,
                  businessIdea: true,
                  feasibilityScore: true,
                  aiRecommendation: true,
                },
              });
              if (latestReport) {
                const score = latestReport.feasibilityScore as Record<string, unknown> | null;
                const rec = latestReport.aiRecommendation as Record<string, unknown> | null;
                const parts: string[] = [];
                parts.push(`Business: ${latestReport.businessCategory}`);
                if (latestReport.businessIdea) parts.push(`Idea: ${latestReport.businessIdea}`);
                if (score?.totalScore !== undefined) parts.push(`Viability Score: ${score.totalScore}/100`);
                if (score?.grade) parts.push(`Grade: ${score.grade}`);
                if (rec?.decision) parts.push(`Decision: ${rec.decision}`);
                if (rec?.summary) parts.push(`Summary: ${rec.summary}`);
                if (Array.isArray(rec?.strengths)) parts.push(`Strengths: ${(rec.strengths as string[]).join(', ')}`);
                if (Array.isArray(rec?.weaknesses)) parts.push(`Weaknesses: ${(rec.weaknesses as string[]).join(', ')}`);
                reportSummary = parts.join('\n');
              }
            }

            userContext = {
              name: user.name,
              age,
              gender: user.gender,
              category: user.category,
              isMinority: user.isMinority ?? undefined,
              location: (() => {
                const loc = user.location as Record<string, string> | null;
                if (!loc) return null;
                return [loc.village, loc.block, loc.district, loc.state].filter(Boolean).join(', ') || null;
              })(),
              reportSummary,
            };
          }
        } catch (err) {
          request.log.warn(err, 'Failed to load user context for chat');
        }
      }

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Session-Id': sessionId,
        'Access-Control-Expose-Headers': 'X-Session-Id',
      });

      try {
        for await (const chunk of chat(sessionId, message, userContext)) {
          reply.raw.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        reply.raw.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
      } catch (err) {
        request.log.error(err, 'Chat stream error');
        reply.raw.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      }

      reply.raw.end();
    },
  );

  /**
   * GET /status — Check if the chatbot is available
   */
  fastify.get(
    '/status',
    {
      schema: {
        tags: ['Chat'],
        summary: 'Check chatbot availability',
        response: {
          200: {
            type: 'object',
            properties: {
              available: { type: 'boolean' },
              model: { type: 'string' },
            },
          },
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (_request, reply) => {
      return reply.send({
        available: isGeminiConfigured(),
        model: isGeminiConfigured() ? 'Gemini' : 'Not configured',
      });
    },
  );

  /**
   * DELETE /session/:id — Clear a chat session
   */
  fastify.delete<{ Params: { id: string } }>(
    '/session/:id',
    {
      schema: {
        tags: ['Chat'],
        summary: 'Clear a chat session',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      clearSession(request.params.id);
      return reply.status(204).send();
    },
  );
}
