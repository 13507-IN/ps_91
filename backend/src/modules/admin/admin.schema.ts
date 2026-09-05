import { z } from 'zod';
import { INGESTION_SOURCES } from '../../ingestion/types.js';

// ============================================================
// Admin Ingestion Schemas
// ============================================================

export const triggerIngestionParamsSchema = z.object({
  source: z.enum(INGESTION_SOURCES),
});

export const triggerIngestionBodySchema = z.object({
  filePath: z.string({ required_error: 'filePath is required' }),
  dryRun: z.boolean().optional().default(false),
  batchSize: z.number().int().positive().optional().default(500),
});

export const triggerAllIngestionBodySchema = z.object({
  fileMap: z.record(z.enum(INGESTION_SOURCES), z.string()),
  dryRun: z.boolean().optional().default(false),
  batchSize: z.number().int().positive().optional().default(500),
});

export type TriggerIngestionParams = z.infer<typeof triggerIngestionParamsSchema>;
export type TriggerIngestionBody = z.infer<typeof triggerIngestionBodySchema>;
export type TriggerAllIngestionBody = z.infer<typeof triggerAllIngestionBodySchema>;
