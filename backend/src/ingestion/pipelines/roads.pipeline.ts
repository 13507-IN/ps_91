import type { PrismaClient, RoadType } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, safeFloat, cleanString } from '../utils.js';

// ============================================================
// PMGSY / Rural Roads Pipeline
// Ingests: Road connectivity data per village
// Source: PMGSY data / rural roads database
// ============================================================

interface RoadRow {
  villageCode: number | undefined;
  villageName: string | null;
  districtName: string | null;
  roadType: RoadType;
  surfaceType: string | null;
  nearestTown: string | null;
  distanceKm: number | undefined;
}

function parseRoadType(raw: string | null | undefined): RoadType {
  if (!raw) return 'OTHER';
  const s = raw.trim().toLowerCase();
  if (s.includes('national') || s.includes('nh')) return 'NATIONAL_HIGHWAY';
  if (s.includes('state') || s.includes('sh')) return 'STATE_HIGHWAY';
  if (s.includes('district') || s.includes('mdr')) return 'DISTRICT_ROAD';
  if (s.includes('pmgsy') || s.includes('rural')) return 'PMGSY_ROAD';
  if (s.includes('village') || s.includes('gram')) return 'VILLAGE_ROAD';
  return 'OTHER';
}

function transformRow(row: Record<string, string>, _index: number): RoadRow {
  return {
    villageCode: safeInt(
      row['Village Code'] ??
        row['Census Code'] ??
        row['Habitation Code'] ??
        row['village_code'],
    ),
    villageName: cleanString(
      row['Village Name'] ??
        row['Habitation Name'] ??
        row['village_name'],
    ),
    districtName: cleanString(
      row['District'] ?? row['District Name'] ?? row['district_name'],
    ),
    roadType: parseRoadType(
      row['Road Type'] ?? row['Road Category'] ?? row['road_type'] ?? row['Category'],
    ),
    surfaceType: cleanString(
      row['Surface Type'] ?? row['Road Surface'] ?? row['surface_type'] ?? row['Pavement Type'],
    ),
    nearestTown: cleanString(
      row['Nearest Town'] ??
        row['Connected Town'] ??
        row['Market Centre'] ??
        row['nearest_town'],
    ),
    distanceKm: safeFloat(
      row['Distance (km)'] ??
        row['Distance'] ??
        row['Road Length'] ??
        row['distance_km'] ??
        row['Length_Km'],
    ),
  };
}

function validateRow(record: RoadRow, _index: number): string[] {
  const errors: string[] = [];
  if (!record.villageCode && !record.villageName) {
    errors.push('Need either village code or village name');
  }
  return errors;
}

export class RoadsPipeline implements DataPipeline {
  readonly source = 'roads' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<RoadRow>(filePath, transformRow, validateRow);

    return processRecords<RoadRow>(
      'roads',
      records,
      async (data, tx) => {
        let villageId: number | null = null;

        if (data.villageCode) {
          const village = await tx.village.findUnique({
            where: { id: data.villageCode },
          });
          if (village) villageId = village.id;
        }

        if (!villageId) return 'skipped';

        // Check for existing road record
        const existing = await tx.roadConnectivity.findFirst({
          where: {
            villageId,
            roadType: data.roadType,
          },
        });

        if (existing) {
          await tx.roadConnectivity.update({
            where: { id: existing.id },
            data: {
              surfaceType: data.surfaceType ?? existing.surfaceType,
              nearestTown: data.nearestTown ?? existing.nearestTown,
              distanceKm: data.distanceKm ?? existing.distanceKm,
              source: 'GOVERNMENT',
            },
          });
          return 'updated';
        }

        await tx.roadConnectivity.create({
          data: {
            villageId,
            roadType: data.roadType,
            surfaceType: data.surfaceType,
            nearestTown: data.nearestTown,
            distanceKm: data.distanceKm ?? null,
            source: 'GOVERNMENT',
          },
        });

        return 'inserted';
      },
      this.prisma,
      options,
    );
  }
}
