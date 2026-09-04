import { z } from 'zod';

// ============================================================
// Auth Zod Schemas
// ============================================================

export const registerSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^[0-9+]+$/, 'Phone number must contain only digits and +'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  name: z.string().min(1).max(200).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

// ============================================================
// Response types
// ============================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    name: string | null;
  };
  tokens: AuthTokens;
}
