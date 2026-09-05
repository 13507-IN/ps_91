import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile, parseJsonFile } from '../parsers/index.js';
import { processRecords, safeInt, cleanString } from '../utils.js';

// ============================================================
// LGD (Local Government Directory) Pipeline
// Ingests: State → District → Block → Village hierarchy
// MUST RUN FIRST — all other pipelines reference these IDs.
// ============================================================

interface LgdVillageRow {
  stateCode: number;
  stateName: string;
  stateNameLocal: string | null;
  districtCode: number;
  districtName: string;
  districtNameLocal: string | null;
  blockCode: number;
  blockName: string;
  blockNameLocal: string | null;
  villageCode: number;
  villageName: string;
  villageNameLocal: string | null;
}

/**
 * Transform a raw CSV row into an LGD record.
 * Handles various column name formats from different LGD data dumps.
 */
function transformRow(row: Record<string, unknown>, _index: number): LgdVillageRow {
  const r = row as Record<string, string | number>;
  // LGD CSV/JSON columns can vary — handle common column name patterns
  const stateCode = safeInt(
    r['State Code'] ?? r['state_code'] ?? r['State Code (LGD)'] ?? r['stateCode'],
  );
  const stateName = cleanString(
    r['State Name'] ?? r['state_name'] ?? r['State Name (In English)'] ?? r['stateName'],
  );
  const districtCode = safeInt(
    r['District Code'] ??
      r['district_code'] ??
      r['District Code (LGD)'] ??
      r['districtCode'],
  );
  const districtName = cleanString(
    r['District Name'] ??
      r['district_name'] ??
      r['District Name (In English)'] ??
      r['districtName'],
  );
  const blockCode = safeInt(
    r['Block Code'] ?? r['block_code'] ?? r['Sub-District Code (LGD)'] ?? r['blockCode'],
  );
  const blockName = cleanString(
    r['Block Name'] ??
      r['block_name'] ??
      r['Sub-District Name (In English)'] ??
      r['blockName'],
  );
  const villageCode = safeInt(
    r['Village Code'] ??
      r['village_code'] ??
      r['Village/Town Code'] ??
      r['Census 2011 Code'] ??
      r['villageCode'],
  );
  const villageName = cleanString(
    r['Village Name'] ??
      r['village_name'] ??
      r['Village/Town Name (In English)'] ??
      r['villageName'],
  );

  if (!stateCode || !stateName || !districtCode || !districtName) {
    throw new Error('Missing required fields: State Code, State Name, District Code, District Name');
  }
  if (!blockCode || !blockName) {
    throw new Error('Missing required fields: Block Code, Block Name');
  }
  if (!villageCode || !villageName) {
    throw new Error('Missing required fields: Village Code, Village Name');
  }

  return {
    stateCode,
    stateName,
    stateNameLocal: cleanString(
      r['State Name (In Local Language)'] ?? r['state_name_local'] ?? r['stateNameLocal'] ?? null,
    ),
    districtCode,
    districtName,
    districtNameLocal: cleanString(
      r['District Name (In Local Language)'] ?? r['district_name_local'] ?? r['districtNameLocal'] ?? null,
    ),
    blockCode,
    blockName,
    blockNameLocal: cleanString(
      r['Block Name (In Local Language)'] ?? r['block_name_local'] ?? r['blockNameLocal'] ?? null,
    ),
    villageCode,
    villageName,
    villageNameLocal: cleanString(
      r['Village Name (In Local Language)'] ?? r['village_name_local'] ?? r['villageNameLocal'] ?? null,
    ),
  };
}

function validateRow(record: LgdVillageRow, _index: number): string[] {
  const errors: string[] = [];
  if (record.stateCode <= 0) errors.push('Invalid state code');
  if (record.districtCode <= 0) errors.push('Invalid district code');
  if (record.blockCode <= 0) errors.push('Invalid block code');
  if (record.villageCode <= 0) errors.push('Invalid village code');
  return errors;
}

export class LgdPipeline implements DataPipeline {
  readonly source = 'lgd' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const isJson = filePath.endsWith('.json');
    const records = isJson
      ? await parseJsonFile<LgdVillageRow>(filePath, transformRow, validateRow)
      : await parseCsvFile<LgdVillageRow>(filePath, (row) => transformRow(row, 0), validateRow);

    // We need a special upsert strategy for LGD:
    // First deduplicate and upsert states, then districts, then blocks, then villages.
    const startTime = Date.now();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errorDetails: string[] = [];

    const validRecords = records.filter((r) => r.isValid);
    const invalidRecords = records.filter((r) => !r.isValid);

    for (const inv of invalidRecords) {
      skipped++;
      errorCount += inv.errors.length;
      errorDetails.push(...inv.errors.slice(0, 10));
    }

    if (options?.dryRun) {
      return {
        source: 'lgd',
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

    // Deduplicate by code
    const states = new Map<number, { name: string; nameLocal: string | null }>();
    const districts = new Map<number, { name: string; nameLocal: string | null; stateId: number }>();
    const blocks = new Map<
      number,
      { name: string; nameLocal: string | null; districtId: number }
    >();
    const villages = new Map<
      number,
      { name: string; nameLocal: string | null; blockId: number }
    >();

    for (const rec of validRecords) {
      const r = rec.data;
      states.set(r.stateCode, { name: r.stateName, nameLocal: r.stateNameLocal });
      districts.set(r.districtCode, {
        name: r.districtName,
        nameLocal: r.districtNameLocal,
        stateId: r.stateCode,
      });
      blocks.set(r.blockCode, {
        name: r.blockName,
        nameLocal: r.blockNameLocal,
        districtId: r.districtCode,
      });
      villages.set(r.villageCode, {
        name: r.villageName,
        nameLocal: r.villageNameLocal,
        blockId: r.blockCode,
      });
    }

    // Upsert in order: States → Districts → Blocks → Villages
    try {
      // States
      for (const [id, data] of states) {
        await this.prisma.state.upsert({
          where: { id },
          create: { id, name: data.name, nameLocal: data.nameLocal },
          update: { name: data.name, nameLocal: data.nameLocal },
        });
      }

      // Districts
      for (const [id, data] of districts) {
        await this.prisma.district.upsert({
          where: { id },
          create: { id, name: data.name, nameLocal: data.nameLocal, stateId: data.stateId },
          update: { name: data.name, nameLocal: data.nameLocal },
        });
      }

      // Blocks
      for (const [id, data] of blocks) {
        await this.prisma.block.upsert({
          where: { id },
          create: {
            id,
            name: data.name,
            nameLocal: data.nameLocal,
            districtId: data.districtId,
          },
          update: { name: data.name, nameLocal: data.nameLocal },
        });
      }

      // Villages (batch in transactions)
      const villageEntries = [...villages.entries()];
      const batchSize = options?.batchSize ?? 500;

      for (let i = 0; i < villageEntries.length; i += batchSize) {
        const batch = villageEntries.slice(i, i + batchSize);
        await this.prisma.$transaction(
          batch.map(([id, data]) =>
            this.prisma.village.upsert({
              where: { id },
              create: { id, name: data.name, nameLocal: data.nameLocal, blockId: data.blockId },
              update: { name: data.name, nameLocal: data.nameLocal },
            }),
          ),
          { maxWait: 10000, timeout: 30000 },
        );
      }

      inserted = states.size + districts.size + blocks.size + villages.size;
    } catch (err) {
      errorCount++;
      errorDetails.push(`DB error: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {
      source: 'lgd',
      status: errorCount > 0 && inserted === 0 ? 'failed' : 'completed',
      totalRows: records.length,
      inserted,
      updated,
      skipped,
      errors: errorCount,
      errorDetails: errorDetails.slice(0, 100),
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}
