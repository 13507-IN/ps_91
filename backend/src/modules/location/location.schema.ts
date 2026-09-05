import { z } from 'zod';

export const searchVillagesQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getVillageParamsSchema = z.object({
  id: z.coerce.number().int().positive('Village ID must be a positive integer'),
});

export const nearbyVillagesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.coerce.number().min(-180).max(180, 'Invalid longitude'),
  radiusKm: z.coerce.number().positive().max(100).default(10),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type SearchVillagesQuery = z.infer<typeof searchVillagesQuerySchema>;
export type GetVillageParams = z.infer<typeof getVillageParamsSchema>;
export type NearbyVillagesQuery = z.infer<typeof nearbyVillagesQuerySchema>;
