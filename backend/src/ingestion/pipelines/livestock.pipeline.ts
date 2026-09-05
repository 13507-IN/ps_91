import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, cleanString } from '../utils.js';

// ============================================================
// Livestock Census Pipeline
// Ingests: Livestock counts by village/district (cattle, buffalo, goat, poultry, etc.)
// Source: DAHD Livestock Census data
// ============================================================

interface LivestockRow {
  villageCode: number | undefined;
  districtName: string | null;
  blockName: string | null;
  villageName: string | null;
  animalType: string;
  count: number | undefined;
  milkProducing: number | undefined;
  censusYear: number | undefined;
}

function transformRow(row: Record<string, string>, _index: number): LivestockRow {
  const animalType = cleanString(
    row['Animal Type'] ??
      row['Species'] ??
      row['Livestock Type'] ??
      row['animal_type'] ??
      row['species'],
  );

  if (!animalType) {
    throw new Error('Missing Animal Type');
  }

  return {
    villageCode: safeInt(row['Village Code'] ?? row['village_code'] ?? row['Census Code']),
    districtName: cleanString(row['District'] ?? row['district_name'] ?? row['District Name']),
    blockName: cleanString(row['Block'] ?? row['block_name'] ?? row['Block Name']),
    villageName: cleanString(row['Village'] ?? row['village_name'] ?? row['Village Name']),
    animalType: animalType.toLowerCase(),
    count: safeInt(
      row['Total Count'] ??
        row['Total'] ??
        row['Number'] ??
        row['Count'] ??
        row['total_count'],
    ),
    milkProducing: safeInt(
      row['In-Milk'] ??
        row['Milking'] ??
        row['Milk Producing'] ??
        row['in_milk'] ??
        row['milch_animals'],
    ),
    censusYear: safeInt(row['Census Year'] ?? row['Year'] ?? row['census_year']),
  };
}

function validateRow(record: LivestockRow, _index: number): string[] {
  const errors: string[] = [];
  if (!record.animalType) errors.push('Missing animal type');
  if (!record.villageCode && !record.districtName) {
    errors.push('Need either village code or district name');
  }
  return errors;
}

export class LivestockPipeline implements DataPipeline {
  readonly source = 'livestock' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<LivestockRow>(filePath, transformRow, validateRow);

    return processRecords<LivestockRow>(
      'livestock',
      records,
      async (data, tx) => {
        let villageId: number | null = null;

        if (data.villageCode) {
          const village = await tx.village.findUnique({
            where: { id: data.villageCode },
          });
          if (village) villageId = village.id;
        }

        if (!villageId) {
          return 'skipped'; // Can't associate without a valid village
        }

        // Check for existing record with same village + animal type
        const existing = await tx.livestockData.findFirst({
          where: {
            villageId,
            animalType: data.animalType,
            censusYear: data.censusYear ?? undefined,
          },
        });

        if (existing) {
          await tx.livestockData.update({
            where: { id: existing.id },
            data: {
              count: data.count ?? existing.count,
              milkProducing: data.milkProducing ?? existing.milkProducing,
              source: 'GOVERNMENT',
              confidence: 'HIGH',
            },
          });
          return 'updated';
        }

        await tx.livestockData.create({
          data: {
            villageId,
            animalType: data.animalType,
            count: data.count ?? null,
            milkProducing: data.milkProducing ?? null,
            censusYear: data.censusYear ?? null,
            source: 'GOVERNMENT',
            confidence: 'HIGH',
          },
        });

        return 'inserted';
      },
      this.prisma,
      options,
    );
  }
}
