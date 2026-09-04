import { z } from 'zod';

// ============================================================
// User Zod Schemas
// ============================================================

export const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('Invalid email address').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  category: z.enum(['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY']).optional(),
  isMinority: z.boolean().optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      village: z.string().optional(),
      block: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  category: string | null;
  isMinority: boolean;
  location: unknown;
  createdAt: string;
}
