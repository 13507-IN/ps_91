import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult, IngestionSource } from './types.js';
import {
  LgdPipeline,
  CensusPipeline,
  UdyamPipeline,
  LivestockPipeline,
  CropPipeline,
  AgmarknetPipeline,
  RoadsPipeline,
  AmenitiesPipeline,
} from './pipelines/index.js';

// ============================================================
// Ingestion Runner
// Orchestrates data ingestion pipelines.
// Can be invoked directly or via BullMQ jobs.
// ============================================================

/** Ordered list of pipelines — LGD must run first */
const PIPELINE_ORDER: IngestionSource[] = [
  'lgd',
  'census',
  'amenities',
  'udyam',
  'livestock',
  'crop',
  'agmarknet',
  'roads',
];

/**
 * Create a pipeline instance for a given source.
 */
function createPipeline(source: IngestionSource, prisma: PrismaClient): DataPipeline {
  switch (source) {
    case 'lgd':
      return new LgdPipeline(prisma);
    case 'census':
      return new CensusPipeline(prisma);
    case 'udyam':
      return new UdyamPipeline(prisma);
    case 'livestock':
      return new LivestockPipeline(prisma);
    case 'crop':
      return new CropPipeline(prisma);
    case 'agmarknet':
      return new AgmarknetPipeline(prisma);
    case 'roads':
      return new RoadsPipeline(prisma);
    case 'amenities':
      return new AmenitiesPipeline(prisma);
    default:
      throw new Error(`Unknown ingestion source: ${source as string}`);
  }
}

/**
 * Run a single ingestion pipeline.
 */
export async function runPipeline(
  source: IngestionSource,
  filePath: string,
  prisma: PrismaClient,
  options?: { dryRun?: boolean; batchSize?: number },
): Promise<IngestionResult> {
  const pipeline = createPipeline(source, prisma);
  return pipeline.run(filePath, options);
}

/**
 * Run all ingestion pipelines in the correct order.
 * Used for full seed / bulk import.
 *
 * @param fileMap - Map of source name to file path
 * @param prisma - Prisma client
 * @param options - Run options
 */
export async function runAllPipelines(
  fileMap: Partial<Record<IngestionSource, string>>,
  prisma: PrismaClient,
  options?: { dryRun?: boolean; batchSize?: number },
): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];

  for (const source of PIPELINE_ORDER) {
    const filePath = fileMap[source];
    if (!filePath) continue;

    const result = await runPipeline(source, filePath, prisma, options);
    results.push(result);

    // If LGD fails, stop — all other pipelines depend on it
    if (source === 'lgd' && result.status === 'failed') {
      break;
    }
  }

  return results;
}

/**
 * Get the expected pipeline execution order.
 */
export function getPipelineOrder(): IngestionSource[] {
  return [...PIPELINE_ORDER];
}
