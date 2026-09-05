import { z } from 'zod';

// ============================================================
// Ingestion Types & Schemas
// ============================================================

/** Supported ingestion data sources */
export const INGESTION_SOURCES = [
  'lgd',
  'census',
  'udyam',
  'livestock',
  'crop',
  'agmarknet',
  'roads',
  'amenities',
] as const;

export type IngestionSource = (typeof INGESTION_SOURCES)[number];

/** Ingestion job status */
export type IngestionJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/** Result returned from each pipeline after processing */
export interface IngestionResult {
  source: IngestionSource;
  status: 'completed' | 'failed';
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
  durationMs: number;
  timestamp: string;
}

/** Schema for triggering an ingestion job */
export const triggerIngestionSchema = z.object({
  source: z.enum(INGESTION_SOURCES),
  filePath: z.string().optional(),
  options: z
    .object({
      dryRun: z.boolean().default(false),
      batchSize: z.number().int().positive().default(500),
      skipValidation: z.boolean().default(false),
    })
    .optional(),
});

export type TriggerIngestionInput = z.infer<typeof triggerIngestionSchema>;

/** A single validated record ready for DB upsert */
export interface ParsedRecord<T> {
  data: T;
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

/** Pipeline interface that all data pipelines must implement */
export interface DataPipeline {
  readonly source: IngestionSource;
  run(filePath: string, options?: { dryRun?: boolean; batchSize?: number }): Promise<IngestionResult>;
}
