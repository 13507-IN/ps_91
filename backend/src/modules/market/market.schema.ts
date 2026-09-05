import { z } from 'zod';
import { BusinessCategory } from '@prisma/client';

export const marketIntelligenceBodySchema = z.object({
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  radiusKm: z.number().positive().max(50).default(10),
  businessCategory: z.nativeEnum(BusinessCategory).optional(),
});

export const competitorsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  radiusKm: z.coerce.number().positive().max(50).default(10),
  category: z.nativeEnum(BusinessCategory).optional(),
});

export const pricesQuerySchema = z.object({
  commodity: z.string().trim().min(1, 'Commodity name is required'),
  district: z.string().trim().default('Nadia'),
});

export const infrastructureQuerySchema = z.object({
  villageId: z.coerce.number().int().positive('Village ID is required'),
});

export type MarketIntelligenceBody = z.infer<typeof marketIntelligenceBodySchema>;
export type CompetitorsQuery = z.infer<typeof competitorsQuerySchema>;
export type PricesQuery = z.infer<typeof pricesQuerySchema>;
export type InfrastructureQuery = z.infer<typeof infrastructureQuerySchema>;
