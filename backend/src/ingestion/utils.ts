import type { PrismaClient } from '@prisma/client';
import type { IngestionResult, ParsedRecord } from './types.js';

// ============================================================
// Shared Ingestion Utilities
// ============================================================

/**
 * Process parsed records in batches, upserting to the database.
 * Provides a standard wrapper around any Prisma upsert operation.
 *
 * @param source - The data source name (for logging)
 * @param records - Parsed records from the parser
 * @param upsertFn - Function that upserts a single valid record to the DB
 * @param batchSize - Number of records to process per transaction batch
 * @param dryRun - If true, validate only — don't write to DB
 */
export async function processRecords<T>(
  source: string,
  records: ParsedRecord<T>[],
  upsertFn: (data: T, prisma: PrismaClient) => Promise<'inserted' | 'updated' | 'skipped'>,
  prisma: PrismaClient,
  options?: { batchSize?: number; dryRun?: boolean },
): Promise<IngestionResult> {
  const startTime = Date.now();
  const batchSize = options?.batchSize ?? 500;
  const dryRun = options?.dryRun ?? false;

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errorCount = 0;
  const errorDetails: string[] = [];

  // Separate valid and invalid records
  const validRecords = records.filter((r) => r.isValid);
  const invalidRecords = records.filter((r) => !r.isValid);

  // Collect errors from invalid records
  for (const invalid of invalidRecords) {
    skipped++;
    for (const err of invalid.errors) {
      if (errorDetails.length < 100) {
        errorDetails.push(err);
      }
      errorCount++;
    }
  }

  if (dryRun) {
    return {
      source: source as IngestionResult['source'],
      status: 'completed',
      totalRows: records.length,
      inserted: 0,
      updated: 0,
      skipped: records.length,
      errors: errorCount,
      errorDetails,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  // Process valid records in batches
  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);

    // Use a transaction per batch for atomicity
    await prisma.$transaction(async (tx: any) => {
      for (const record of batch) {
        try {
          const result = await upsertFn(record.data, tx as unknown as PrismaClient);
          switch (result) {
            case 'inserted':
              inserted++;
              break;
            case 'updated':
              updated++;
              break;
            case 'skipped':
              skipped++;
              break;
          }
        } catch (err) {
          errorCount++;
          if (errorDetails.length < 100) {
            errorDetails.push(
              `Row ${record.rowIndex}: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }
    });
  }

  return {
    source: source as IngestionResult['source'],
    status: errorCount > records.length * 0.5 ? 'failed' : 'completed',
    totalRows: records.length,
    inserted,
    updated,
    skipped,
    errors: errorCount,
    errorDetails,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Safe number parser — returns undefined for empty/invalid values.
 */
export function safeInt(value: string | undefined | null): number | undefined {
  if (!value || value.trim() === '' || value.trim() === '-') return undefined;
  const num = parseInt(value.trim(), 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Safe float parser — returns undefined for empty/invalid values.
 */
export function safeFloat(value: string | undefined | null): number | undefined {
  if (!value || value.trim() === '' || value.trim() === '-') return undefined;
  const num = parseFloat(value.trim());
  return isNaN(num) ? undefined : num;
}

/**
 * Clean a string value — trim, return null if empty.
 */
export function cleanString(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === '' || trimmed === '-' || trimmed === 'NA' ? null : trimmed;
}

/**
 * Clean a boolean value from various representations.
 */
export function safeBool(value: string | undefined | null): boolean | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (['yes', 'y', '1', 'true', 'available'].includes(v)) return true;
  if (['no', 'n', '0', 'false', 'not available', 'na'].includes(v)) return false;
  return null;
}
