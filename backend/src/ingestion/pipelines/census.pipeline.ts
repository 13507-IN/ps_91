import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, safeFloat, cleanString } from '../utils.js';

// ============================================================
// Census Data Pipeline
// Ingests: Village-level population, demographics, workers
// Source: Census of India 2011 village-level data
// ============================================================

interface CensusRow {
  villageCode: number;
  totalPopulation: number | undefined;
  malePopulation: number | undefined;
  femalePopulation: number | undefined;
  totalHouseholds: number | undefined;
  scPopulation: number | undefined;
  stPopulation: number | undefined;
  literacyRate: number | undefined;
  workingPopulation: number | undefined;
  mainWorkers: number | undefined;
  marginalWorkers: number | undefined;
  nonWorkers: number | undefined;
  cultivators: number | undefined;
  agriculturalLabourers: number | undefined;
  householdWorkers: number | undefined;
  otherWorkers: number | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
}

function transformRow(row: Record<string, string>, _index: number): CensusRow {
  const villageCode = safeInt(
    row['Village Code'] ??
      row['Census Code'] ??
      row['Town/Village Code'] ??
      row['village_code'] ??
      row['villageCode'],
  );

  if (!villageCode) {
    throw new Error('Missing Village Code');
  }

  return {
    villageCode,
    totalPopulation: safeInt(
      row['Total Population'] ?? row['TOT_P'] ?? row['total_population'] ?? row['Population'],
    ),
    malePopulation: safeInt(
      row['Male Population'] ?? row['TOT_M'] ?? row['male_population'] ?? row['Male'],
    ),
    femalePopulation: safeInt(
      row['Female Population'] ?? row['TOT_F'] ?? row['female_population'] ?? row['Female'],
    ),
    totalHouseholds: safeInt(
      row['Total Households'] ?? row['No_HH'] ?? row['total_households'] ?? row['Households'],
    ),
    scPopulation: safeInt(row['SC Population'] ?? row['P_SC'] ?? row['sc_population']),
    stPopulation: safeInt(row['ST Population'] ?? row['P_ST'] ?? row['st_population']),
    literacyRate: safeFloat(
      row['Literacy Rate'] ?? row['literacy_rate'] ?? row['Effective Literacy Rate'],
    ),
    workingPopulation: safeInt(
      row['Working Population'] ?? row['TOT_WORK_P'] ?? row['working_population'],
    ),
    mainWorkers: safeInt(row['Main Workers'] ?? row['MAINWORK_P'] ?? row['main_workers']),
    marginalWorkers: safeInt(
      row['Marginal Workers'] ?? row['MARGWORK_P'] ?? row['marginal_workers'],
    ),
    nonWorkers: safeInt(row['Non Workers'] ?? row['NON_WORK_P'] ?? row['non_workers']),
    cultivators: safeInt(row['Cultivators'] ?? row['MAIN_CL_P'] ?? row['cultivators']),
    agriculturalLabourers: safeInt(
      row['Agricultural Labourers'] ?? row['MAIN_AL_P'] ?? row['agricultural_labourers'],
    ),
    householdWorkers: safeInt(
      row['Household Workers'] ?? row['MAIN_HH_P'] ?? row['household_workers'],
    ),
    otherWorkers: safeInt(row['Other Workers'] ?? row['MAIN_OT_P'] ?? row['other_workers']),
    latitude: safeFloat(row['Latitude'] ?? row['latitude'] ?? row['lat']),
    longitude: safeFloat(row['Longitude'] ?? row['longitude'] ?? row['lng'] ?? row['lon']),
  };
}

function validateRow(record: CensusRow, _index: number): string[] {
  const errors: string[] = [];
  if (record.villageCode <= 0) errors.push('Invalid village code');
  if (
    record.totalPopulation !== undefined &&
    record.totalPopulation < 0
  ) {
    errors.push('Negative population');
  }
  return errors;
}

export class CensusPipeline implements DataPipeline {
  readonly source = 'census' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<CensusRow>(filePath, transformRow, validateRow);

    const result = await processRecords<CensusRow>(
      'census',
      records,
      async (data, tx) => {
        // Check village exists
        const village = await tx.village.findUnique({
          where: { id: data.villageCode },
        });

        if (!village) {
          return 'skipped'; // Village not in LGD data — skip
        }

        // Update village coordinates if available
        if (data.latitude && data.longitude) {
          await tx.village.update({
            where: { id: data.villageCode },
            data: {
              latitude: data.latitude,
              longitude: data.longitude,
            },
          });
        }

        // Upsert census data
        await tx.censusData.upsert({
          where: { villageId: data.villageCode },
          create: {
            villageId: data.villageCode,
            totalPopulation: data.totalPopulation ?? null,
            malePopulation: data.malePopulation ?? null,
            femalePopulation: data.femalePopulation ?? null,
            totalHouseholds: data.totalHouseholds ?? null,
            scPopulation: data.scPopulation ?? null,
            stPopulation: data.stPopulation ?? null,
            literacyRate: data.literacyRate ?? null,
            workingPopulation: data.workingPopulation ?? null,
            mainWorkers: data.mainWorkers ?? null,
            marginalWorkers: data.marginalWorkers ?? null,
            nonWorkers: data.nonWorkers ?? null,
            cultivators: data.cultivators ?? null,
            agriculturalLabourers: data.agriculturalLabourers ?? null,
            householdWorkers: data.householdWorkers ?? null,
            otherWorkers: data.otherWorkers ?? null,
            censusYear: 2011,
            confidence: 'HIGH',
          },
          update: {
            totalPopulation: data.totalPopulation ?? undefined,
            malePopulation: data.malePopulation ?? undefined,
            femalePopulation: data.femalePopulation ?? undefined,
            totalHouseholds: data.totalHouseholds ?? undefined,
            scPopulation: data.scPopulation ?? undefined,
            stPopulation: data.stPopulation ?? undefined,
            literacyRate: data.literacyRate ?? undefined,
            workingPopulation: data.workingPopulation ?? undefined,
            mainWorkers: data.mainWorkers ?? undefined,
            marginalWorkers: data.marginalWorkers ?? undefined,
            nonWorkers: data.nonWorkers ?? undefined,
            cultivators: data.cultivators ?? undefined,
            agriculturalLabourers: data.agriculturalLabourers ?? undefined,
            householdWorkers: data.householdWorkers ?? undefined,
            otherWorkers: data.otherWorkers ?? undefined,
          },
        });

        return 'inserted';
      },
      this.prisma,
      options,
    );

    // After ingestion, update PostGIS geometry for all villages with coordinates
    if (!options?.dryRun) {
      try {
        await this.prisma.$executeRawUnsafe(`
          UPDATE "Village"
          SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
          WHERE latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND geom IS NULL;
        `);
      } catch {
        // PostGIS might not be available in test environments
      }
    }

    return result;
  }
}
