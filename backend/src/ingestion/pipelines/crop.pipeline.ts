import type { PrismaClient, CropSeason } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, safeFloat, cleanString } from '../utils.js';

// ============================================================
// Crop Production Pipeline
// Ingests: District/block-level crop production statistics
// Source: data.gov.in crop production data
// ============================================================

interface CropRow {
  districtName: string;
  cropName: string;
  season: CropSeason;
  areaHectares: number | undefined;
  productionTonnes: number | undefined;
  yieldPerHectare: number | undefined;
  year: number | undefined;
  villageCode: number | undefined;
}

function parseSeason(raw: string | null | undefined): CropSeason {
  if (!raw) return 'WHOLE_YEAR';
  const s = raw.trim().toLowerCase();
  if (s.includes('kharif') || s.includes('monsoon')) return 'KHARIF';
  if (s.includes('rabi') || s.includes('winter')) return 'RABI';
  if (s.includes('zaid') || s.includes('summer')) return 'ZAID';
  if (s.includes('whole') || s.includes('annual') || s.includes('total')) return 'WHOLE_YEAR';
  return 'WHOLE_YEAR';
}

function transformRow(row: Record<string, string>, _index: number): CropRow {
  const districtName = cleanString(
    row['District Name'] ?? row['District'] ?? row['district_name'] ?? row['district'],
  );
  const cropName = cleanString(
    row['Crop'] ?? row['Crop Name'] ?? row['crop_name'] ?? row['crop'],
  );

  if (!districtName || !cropName) {
    throw new Error('Missing District Name or Crop Name');
  }

  return {
    districtName,
    cropName,
    season: parseSeason(row['Season'] ?? row['season']),
    areaHectares: safeFloat(
      row['Area (Hectares)'] ?? row['Area'] ?? row['area_hectares'] ?? row['Area_Ha'],
    ),
    productionTonnes: safeFloat(
      row['Production (Tonnes)'] ??
        row['Production'] ??
        row['production_tonnes'] ??
        row['Production_Tonnes'],
    ),
    yieldPerHectare: safeFloat(
      row['Yield (per Hectare)'] ??
        row['Yield'] ??
        row['yield_per_hectare'] ??
        row['Yield_Kg_Ha'],
    ),
    year: safeInt(row['Year'] ?? row['Crop Year'] ?? row['year'] ?? row['crop_year']),
    villageCode: safeInt(row['Village Code'] ?? row['village_code']),
  };
}

function validateRow(record: CropRow, _index: number): string[] {
  const errors: string[] = [];
  if (!record.districtName) errors.push('Missing district name');
  if (!record.cropName) errors.push('Missing crop name');
  return errors;
}

export class CropPipeline implements DataPipeline {
  readonly source = 'crop' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<CropRow>(filePath, transformRow, validateRow);

    return processRecords<CropRow>(
      'crop',
      records,
      async (data, tx) => {
        // Check for existing record
        const existing = await tx.cropData.findFirst({
          where: {
            districtName: data.districtName,
            cropName: data.cropName,
            season: data.season,
            year: data.year ?? undefined,
          },
        });

        if (existing) {
          await tx.cropData.update({
            where: { id: existing.id },
            data: {
              areaHectares: data.areaHectares ?? existing.areaHectares,
              productionTonnes: data.productionTonnes ?? existing.productionTonnes,
              yieldPerHectare: data.yieldPerHectare ?? existing.yieldPerHectare,
              source: 'GOVERNMENT',
              confidence: 'HIGH',
            },
          });
          return 'updated';
        }

        await tx.cropData.create({
          data: {
            villageId: data.villageCode ?? null,
            districtName: data.districtName,
            cropName: data.cropName,
            season: data.season,
            areaHectares: data.areaHectares ?? null,
            productionTonnes: data.productionTonnes ?? null,
            yieldPerHectare: data.yieldPerHectare ?? null,
            year: data.year ?? null,
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
