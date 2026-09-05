import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
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
function transformRow(row: Record<string, string>, _index: number): LgdVillageRow {
  // LGD CSV columns can vary — handle common column name patterns
  const stateCode = safeInt(
    row['State Code'] ?? row['state_code'] ?? row['State Code (LGD)'] ?? row['stateCode'],
  );
  const stateName = cleanString(
    row['State Name'] ?? row['state_name'] ?? row['State Name (In English)'] ?? row['stateName'],
  );
  const districtCode = safeInt(
    row['District Code'] ??
      row['district_code'] ??
      row['District Code (LGD)'] ??
      row['districtCode'],
  );
  const districtName = cleanString(
    row['District Name'] ??
      row['district_name'] ??
      row['District Name (In English)'] ??
      row['districtName'],
  );
  const blockCode = safeInt(
    row['Block Code'] ?? row['block_code'] ?? row['Sub-District Code (LGD)'] ?? row['blockCode'],
  );
  const blockName = cleanString(
    row['Block Name'] ??
      row['block_name'] ??
      row['Sub-District Name (In English)'] ??
      row['blockName'],
  );
  const villageCode = safeInt(
    row['Village Code'] ??
      row['village_code'] ??
      row['Village/Town Code'] ??
      row['Census 2011 Code'] ??
      row['villageCode'],
  );
  const villageName = cleanString(
    row['Village Name'] ??
      row['village_name'] ??
      row['Village/Town Name (In English)'] ??
      row['villageName'],
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
      row['State Name (In Local Language)'] ?? row['state_name_local'] ?? null,
    ),
    districtCode,
    districtName,
    districtNameLocal: cleanString(
      row['District Name (In Local Language)'] ?? row['district_name_local'] ?? null,
    ),
    blockCode,
    blockName,
    blockNameLocal: cleanString(
      row['Block Name (In Local Language)'] ?? row['block_name_local'] ?? null,
    ),
    villageCode,
    villageName,
    villageNameLocal: cleanString(
      row['Village Name (In Local Language)'] ?? row['village_name_local'] ?? null,
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
    const records = await parseCsvFile<LgdVillageRow>(filePath, transformRow, validateRow);

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
