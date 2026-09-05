import { z } from 'zod';
import { SocialCategory, Gender, BusinessCategory } from '@prisma/client';

export const matchSchemesInputSchema = z.object({
  age: z.number().int().min(14).max(100).optional(),
  gender: z.nativeEnum(Gender).optional(),
  category: z.nativeEnum(SocialCategory).optional(),
  isMinority: z.boolean().optional(),
  businessCategory: z.nativeEnum(BusinessCategory).optional(),
  projectCost: z.number().positive('Project cost must be positive'),
  availableMargin: z.number().min(0).optional(),
  state: z.string().optional().default('West Bengal'),
  district: z.string().optional(),
});

export const getSchemeParamsSchema = z.object({
  id: z.string(),
});

export type MatchSchemesInput = z.infer<typeof matchSchemesInputSchema>;
export type GetSchemeParams = z.infer<typeof getSchemeParamsSchema>;
