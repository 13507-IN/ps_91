import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { FeasibilityService } from './feasibility.service.js';
import { analyzeFeasibilityBodySchema } from './feasibility.schema.js';

export async function handleAnalyzeStream(
  request: FastifyRequest,
  reply: FastifyReply,
  fastify: FastifyInstance,
) {
  const body = analyzeFeasibilityBodySchema.parse(request.body);

  // Optional authenticated user id
  let userId: string | undefined;
  try {
    await fastify.authenticate(request, reply);
    userId = request.userId;
  } catch {
    // Unauthenticated guest evaluation is supported
  }

  // Set up SSE headers
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': (request.headers.origin as string) ?? '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  const sendEvent = (event: string, data: unknown) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const service = new FeasibilityService(fastify.prisma);

  try {
    const result = await service.analyze(
      body,
      userId,
      (step: number, message: string, progress: number) => {
        sendEvent('progress', { step, message, progress });
      },
    );

    // Send final result event
    sendEvent('complete', result);
    reply.raw.end();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
    sendEvent('error', { error: errorMessage });
    reply.raw.end();
  }
}
