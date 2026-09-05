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

    // Use a transaction per batch for atomicity (with extended timeout for seeding)
    await prisma.$transaction(
      async (tx: any) => {
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
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );
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
 * Safe number parser — handles strings and numbers safely.
 */
export function safeInt(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return isNaN(value) ? undefined : Math.floor(value);
  const str = String(value).trim();
  if (str === '' || str === '-') return undefined;
  const num = parseInt(str, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Safe float parser — handles strings and numbers safely.
 */
export function safeFloat(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return isNaN(value) ? undefined : value;
  const str = String(value).trim();
  if (str === '' || str === '-') return undefined;
  const num = parseFloat(str);
  return isNaN(num) ? undefined : num;
}

/**
 * Clean a string value — trim, return null if empty.
 */
export function cleanString(value: string | number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str === '' || str === '-' || str === 'NA' ? null : str;
}

/**
 * Clean a boolean value from various representations.
 */
export function safeBool(value: string | boolean | number | undefined | null): boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  const v = String(value).trim().toLowerCase();
  if (['yes', 'y', '1', 'true', 'available'].includes(v)) return true;
  if (['no', 'n', '0', 'false', 'not available', 'na'].includes(v)) return false;
  return null;
}
