import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import type { RegisterInput, LoginInput, AuthResponse, AuthTokens } from './auth.schema.js';
import { ConflictError, UnauthorizedError } from '../../lib/errors.js';
import { BCRYPT_SALT_ROUNDS } from '../../config/constants.js';
import { getEnv } from '../../config/env.js';

// ============================================================
// Auth Service — handles registration, login, token management
// ============================================================

export class AuthService {
  constructor(private readonly fastify: FastifyInstance) {}

  /**
   * Register a new user with phone + password.
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if phone already exists
    const existing = await this.fastify.prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (existing) {
      throw new ConflictError('An account with this phone number already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await this.fastify.prisma.user.create({
      data: {
        phone: input.phone,
        passwordHash,
        name: input.name ?? null,
      },
      select: {
        id: true,
        phone: true,
        name: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, tokens };
  }

  /**
   * Login with phone + password.
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.fastify.prisma.user.findUnique({
      where: { phone: input.phone },
      select: {
        id: true,
        phone: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid phone number or password');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      tokens,
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Find the refresh token in DB
    const storedToken = await this.fastify.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.fastify.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Rotate: delete old token, create new pair
    await this.fastify.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return this.generateTokens(storedToken.user.id);
  }

  /**
   * Logout — invalidate the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await this.fastify.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Generate access + refresh token pair.
   */
  private async generateTokens(userId: string): Promise<AuthTokens> {
    const env = getEnv();

    // Access token (short-lived, signed with JWT)
    const accessToken = this.fastify.jwt.sign(
      { sub: userId },
      { expiresIn: env.JWT_ACCESS_EXPIRY },
    );

    // Refresh token (long-lived, stored in DB)
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');

    // Parse expiry for DB storage
    const refreshExpiryMs = parseExpiry(env.JWT_REFRESH_EXPIRY);

    await this.fastify.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt: new Date(Date.now() + refreshExpiryMs),
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}

/**
 * Parse human-readable expiry string (e.g., '7d', '15m', '1h') to milliseconds.
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  }
  const value = parseInt(match[1]!, 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
