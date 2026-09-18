import { z } from 'zod';
import type { OtpPurpose } from '../../config/otp.js';

// ============================================================
// OTP Zod Schemas — Request & Response Validation
// ============================================================

/**
 * Schema for requesting an OTP to be sent to a phone number.
 */
export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^\+?[0-9]{10,15}$/, 'Phone number must contain only digits, optionally starting with +'),
  purpose: z.enum(['REGISTER', 'LOGIN', 'VERIFY']).default('REGISTER'),
  name: z.string().min(1).max(200).optional(),
});

/**
 * Schema for verifying an OTP submitted by the user.
 */
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number is required')
    .max(15)
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  code: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  purpose: z.enum(['REGISTER', 'LOGIN', 'VERIFY']).default('REGISTER'),
  name: z.string().min(1).max(200).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100).optional(),
});

// ============================================================
// Inferred TypeScript Types
// ============================================================

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// ============================================================
// Response Types
// ============================================================

export interface SendOtpResponse {
  message: string;
  expiresInMinutes: number;
  /** Only set in development mode — never sent in production */
  devOtp?: string;
}

export interface VerifyOtpResponse {
  user: {
    id: string;
    phone: string;
    name: string | null;
    isNew: boolean; // true = newly registered, false = existing user logged in
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ============================================================
// Internal OTP record shape (matches Prisma OtpCode model)
// ============================================================

export interface OtpRecord {
  id: string;
  phone: string;
  code: string;        // bcrypt hash
  purpose: OtpPurpose;
  attempts: number;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}
