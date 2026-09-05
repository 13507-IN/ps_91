import { z } from 'zod';
import { BusinessCategory, Gender, SocialCategory } from '@prisma/client';

export const analyzeFeasibilityBodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  villageId: z.number().int().positive().optional(),
  catchmentRadiusKm: z.number().positive().max(50).optional().default(10),
  businessCategory: z.nativeEnum(BusinessCategory).optional(),
  businessIdea: z.string().trim().min(2, 'Business idea or description is required'),
  availableCapital: z.number().positive('Available capital (margin money) must be greater than 0'),
  
  // Optional user profile info for scheme matching
  age: z.number().int().min(18).max(90).optional(),
  gender: z.nativeEnum(Gender).optional(),
  category: z.nativeEnum(SocialCategory).optional(),
  isMinority: z.boolean().optional(),

  // Optional background details
  businessExperience: z.string().optional(),
  availableLand: z.string().optional(),
  availableEquipment: z.string().optional(),
  expectedWorkingHours: z.number().positive().max(24).optional(),
});

export const getAnalysisParamsSchema = z.object({
  id: z.string().cuid('Invalid analysis ID'),
});

export type AnalyzeFeasibilityBody = z.input<typeof analyzeFeasibilityBodySchema>;
export type GetAnalysisParams = z.infer<typeof getAnalysisParamsSchema>;
