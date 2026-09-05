import { z } from 'zod';
import {
  BusinessCategory,
  BusinessScale,
  PriceRange,
  OperatingStatus,
  DataSource,
} from '@prisma/client';

export const listBusinessesQuerySchema = z.object({
  villageId: z.coerce.number().int().positive().optional(),
  category: z.nativeEnum(BusinessCategory).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createBusinessBodySchema = z.object({
  name: z.string().trim().min(1, 'Business name is required').max(100),
  category: z.nativeEnum(BusinessCategory),
  subcategory: z.string().trim().max(100).optional(),
  products: z.array(z.string().trim().min(1)).min(1, 'At least one product/service required'),
  villageId: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  scale: z.nativeEnum(BusinessScale).optional(),
  priceRange: z.nativeEnum(PriceRange).optional(),
  operatingStatus: z.nativeEnum(OperatingStatus).optional().default(OperatingStatus.ACTIVE),
  seasonality: z.string().max(100).optional(),
  source: z.nativeEnum(DataSource).optional().default(DataSource.COMMUNITY_REPORT),
});

export const businessDensityQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(50).default(10),
  category: z.nativeEnum(BusinessCategory).optional(),
});

export type ListBusinessesQuery = z.infer<typeof listBusinessesQuerySchema>;
export type CreateBusinessBody = z.input<typeof createBusinessBodySchema>;
export type BusinessDensityQuery = z.infer<typeof businessDensityQuerySchema>;
