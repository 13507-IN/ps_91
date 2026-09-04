import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { updateUserSchema } from './user.schema.js';
import { UserService } from './user.service.js';
import { BadRequestError } from '../../lib/errors.js';

// ============================================================
// User Routes — all routes require authentication
// ============================================================

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const userService = new UserService(fastify);

  // All routes in this module require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // ---- GET /api/users/me ----
  fastify.get(
    '/me',
    {
      schema: {
        tags: ['User'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              phone: { type: 'string' },
              name: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              gender: { type: 'string', nullable: true },
              dateOfBirth: { type: 'string', nullable: true },
              category: { type: 'string', nullable: true },
              isMinority: { type: 'boolean' },
              location: { type: 'object', nullable: true },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const profile = await userService.getProfile(request.userId!);
      return reply.send(profile);
    },
  );

  // ---- PATCH /api/users/me ----
  fastify.patch(
    '/me',
    {
      schema: {
        tags: ['User'],
        summary: 'Update current user profile',
        description:
          'Update profile details including name, email, demographic info (category, gender), and location. All fields are optional.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 200 },
            email: { type: 'string', format: 'email' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
            dateOfBirth: { type: 'string', format: 'date-time' },
            category: { type: 'string', enum: ['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY'] },
            isMinority: { type: 'boolean' },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number', minimum: -90, maximum: 90 },
                longitude: { type: 'number', minimum: -180, maximum: 180 },
                village: { type: 'string' },
                block: { type: 'string' },
                district: { type: 'string' },
                state: { type: 'string' },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              phone: { type: 'string' },
              name: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              gender: { type: 'string', nullable: true },
              dateOfBirth: { type: 'string', nullable: true },
              category: { type: 'string', nullable: true },
              isMinority: { type: 'boolean' },
              location: { type: 'object', nullable: true },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = updateUserSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const profile = await userService.updateProfile(request.userId!, parsed.data);
      return reply.send(profile);
    },
  );
}
