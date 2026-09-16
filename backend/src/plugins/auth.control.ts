import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { OtpService } from '../modules/auth/otp.service.js';

// ============================================================
// Auth Controller Plugin
//
// Decorates the Fastify instance with an `otpService` accessor
// so OTP functionality can be accessed from any route or hook.
// This keeps the OTP service as a singleton (one instance per app).
// ============================================================

async function authControlPlugin(fastify: FastifyInstance): Promise<void> {
  const otpService = new OtpService(fastify);

  // Decorate with the OTP service singleton
  fastify.decorate('otpService', otpService);

  fastify.log.info('✅ Auth controller (OTP service) loaded');
}

export default fp(authControlPlugin, {
  name: 'auth-control',
  // Must run after prisma and auth plugins are registered
  dependencies: ['prisma', 'auth'],
});

// ============================================================
// Type Augmentation — extend FastifyInstance with otpService
// ============================================================

declare module 'fastify' {
  interface FastifyInstance {
    otpService: OtpService;
  }
}
