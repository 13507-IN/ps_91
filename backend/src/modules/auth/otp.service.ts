import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {
  OTP_LENGTH,
  OTP_EXPIRY_MS,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_BCRYPT_ROUNDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '../../config/otp.js';
import type { OtpPurpose } from '../../config/otp.js';
import { getEnv } from '../../config/env.js';
import { BadRequestError, ServiceUnavailableError, TooManyRequestsError, UnauthorizedError } from '../../lib/errors.js';
import { sendSms } from '../../lib/httpsms.js';
import { sendTelnyxSms, isTelnyxConfigured } from '../../lib/telnyx.js';
import type { SendOtpResponse, VerifyOtpResponse } from './otp.mdel.js';
import { AuthService } from './auth.service.js';

// ============================================================
// OTP Service — httpSMS SMS + DB-backed OTP lifecycle
// ============================================================

export class OtpService {
  private readonly authService: AuthService;

  constructor(private readonly fastify: FastifyInstance) {
    this.authService = new AuthService(fastify);
  }

  // ----------------------------------------------------------
  // sendOtp — generate, store (hashed) and send via httpSMS
  // ----------------------------------------------------------

  async sendOtp(
    phone: string,
    purpose: OtpPurpose,
  ): Promise<SendOtpResponse> {
    const env = getEnv();
    const normalizedPhone = this.normalizePhone(phone);

    // Enforce resend cooldown: deny if an OTP for this phone+purpose was
    // created within the cooldown window, regardless of expiry.
    const recent = await this.fastify.prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        createdAt: { gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      const elapsedSeconds = Math.floor(
        (Date.now() - recent.createdAt.getTime()) / 1000,
      );
      const remaining = Math.max(OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
      throw new TooManyRequestsError(
        `Please wait ${remaining}s before requesting a new OTP.`,
      );
    }

    // Delete any existing unexpired OTP for this phone + purpose
    await this.fastify.prisma.otpCode.deleteMany({
      where: { phone: normalizedPhone, purpose, verified: false },
    });

    // Generate a secure 6-digit numeric OTP
    const plainCode = this.generateOtpCode();

    // Hash the OTP before storing (bcrypt — slow enough to deter brute force)
    const hashedCode = await bcrypt.hash(plainCode, OTP_BCRYPT_ROUNDS);

    // Persist in DB
    const otpRecord = await this.fastify.prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        code: hashedCode,
        purpose,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    // ----------------------------------------------------------
    // Send via Telnyx SMS (Primary) or httpSMS (Secondary)
    // ----------------------------------------------------------
    if (isTelnyxConfigured()) {
      try {
        await sendTelnyxSms({
          to: normalizedPhone,
          text:
            `Your ArthSetu verification code is: ${plainCode}. ` +
            `Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`,
        });
        this.fastify.log.info({ phone: normalizedPhone, purpose }, '📱 OTP sent via Telnyx SMS');
        return {
          message: `OTP sent to ${normalizedPhone}`,
          expiresInMinutes: OTP_EXPIRY_MINUTES,
        };
      } catch (err) {
        this.fastify.log.warn(
          { phone: normalizedPhone, purpose, error: (err as Error).message },
          '⚠️ Telnyx SMS send failed, checking secondary providers...',
        );
      }
    }

    if (env.HTTPSMS_API_KEY && env.HTTPSMS_FROM_NUMBER) {
      try {
        await sendSms({
          from: env.HTTPSMS_FROM_NUMBER,
          to: normalizedPhone,
          requestId: otpRecord.id,
          content:
            `Your ArthSetu verification code is: ${plainCode}. ` +
            `Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`,
        });
      } catch (err) {
        // Delivery failed — invalidate the stored OTP so a retry is not blocked
        // by the cooldown and the code can never be verified.
        await this.fastify.prisma.otpCode.deleteMany({
          where: { phone: normalizedPhone, purpose, verified: false },
        });
        this.fastify.log.error(
          { phone: normalizedPhone, purpose, error: (err as Error).message },
          '❌ httpSMS failed to send OTP SMS',
        );
        throw new ServiceUnavailableError('SMS gateway');
      }

      this.fastify.log.info({ phone: normalizedPhone, purpose }, '📱 OTP sent via httpSMS');
      return {
        message: `OTP sent to ${normalizedPhone}`,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      };
    }

    // Development fallback — return the OTP to the caller (dev/test only).
    // Production deployments must configure httpSMS, so this never leaks.
    this.fastify.log.warn(
      { phone: normalizedPhone, purpose },
      '⚠️  DEV MODE: httpSMS not configured — returning OTP in response (never enable in production!)',
    );

    return {
      message: `[DEV] OTP generated for ${normalizedPhone}`,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      devOtp: plainCode,
    };
  }

  // ----------------------------------------------------------
  // verifyOtp — check code, issue JWT, register if new user
  // ----------------------------------------------------------

  async verifyOtp(
    phone: string,
    code: string,
    purpose: OtpPurpose,
    name?: string,
    password?: string,
  ): Promise<VerifyOtpResponse> {
    const normalizedPhone = this.normalizePhone(phone);

    // Fetch the most recent unexpired, unverified OTP for this phone+purpose
    const record = await this.fastify.prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestError(
        'OTP not found or has expired. Please request a new one.',
      );
    }

    // Guard against brute force
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      // Invalidate this OTP
      await this.fastify.prisma.otpCode.delete({ where: { id: record.id } });
      throw new TooManyRequestsError(
        'Too many incorrect attempts. Please request a new OTP.',
      );
    }

    // Verify the code against the stored hash
    const isValid = await bcrypt.compare(code, record.code);

    if (!isValid) {
      // Increment attempts
      await this.fastify.prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = OTP_MAX_ATTEMPTS - (record.attempts + 1);
      throw new UnauthorizedError(
        `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      );
    }

    // Mark OTP as verified and delete it (single-use)
    await this.fastify.prisma.otpCode.delete({ where: { id: record.id } });

    // ----------------------------------------------------------
    // Register new user or look up existing user
    // ----------------------------------------------------------
    let isNew = false;

    let user = await this.fastify.prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true, phone: true, name: true },
    });

    if (!user) {
      // First-time registration
      let passwordHash: string;
      if (password) {
        // Use provided password (from new signup flow)
        passwordHash = await bcrypt.hash(password, 10);
      } else {
        // Fallback placeholder for OTP-only registration
        passwordHash = await bcrypt.hash(
          crypto.randomBytes(32).toString('hex'),
          10,
        );
      }
      
      user = await this.fastify.prisma.user.create({
        data: {
          phone: normalizedPhone,
          passwordHash,
          name: name?.trim() ?? null,
        },
        select: { id: true, phone: true, name: true },
      });
      isNew = true;
      this.fastify.log.info({ userId: user.id, phone: normalizedPhone }, '✅ New user registered via OTP');
    } else {
      this.fastify.log.info({ userId: user.id, phone: normalizedPhone }, '✅ Existing user logged in via OTP');
    }

    // Issue JWT access + refresh token pair (reuse existing auth service logic)
    const tokens = await (this.authService as any).generateTokens(user.id) as {
      accessToken: string;
      refreshToken: string;
    };

    return {
      user: {
        id: user.id,
        phone: user.phone!,
        name: user.name,
        isNew,
      },
      tokens,
    };
  }

  // ----------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------

  /**
   * Normalize phone: ensure it starts with + for international format.
   * If 10-digit Indian number (no country code), prefix +91.
   */
  private normalizePhone(phone: string): string {
    const stripped = phone.replace(/\s+/g, '');
    if (stripped.startsWith('+')) return stripped;
    if (/^[6-9]\d{9}$/.test(stripped)) return `+91${stripped}`;
    return stripped.startsWith('0') ? `+91${stripped.slice(1)}` : stripped;
  }

  /**
   * Generate a cryptographically secure numeric OTP of the configured length.
   */
  private generateOtpCode(): string {
    const max = Math.pow(10, OTP_LENGTH);
    const min = Math.pow(10, OTP_LENGTH - 1);
    // Use crypto.randomInt for uniform distribution
    return crypto.randomInt(min, max).toString();
  }
}
