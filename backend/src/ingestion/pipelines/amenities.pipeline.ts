import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, safeFloat, safeBool, cleanString } from '../utils.js';

// ============================================================
// Village Amenities Pipeline
// Ingests: Infrastructure data per village (schools, health, banks, etc.)
// Source: Census 2011 Village Amenities data
// ============================================================

interface AmenityRow {
  villageCode: number;
  hasPrimarySchool: boolean | null;
  hasMiddleSchool: boolean | null;
  hasHighSchool: boolean | null;
  hasPHC: boolean | null;
  hasPostOffice: boolean | null;
  hasBankBranch: boolean | null;
  hasATM: boolean | null;
  hasElectricity: boolean | null;
  hasBusService: boolean | null;
  hasRailway: boolean | null;
  hasMobileNetwork: boolean | null;
  hasInternet: boolean | null;
  nearestTownKm: number | undefined;
}

function transformRow(row: Record<string, string>, _index: number): AmenityRow {
  const villageCode = safeInt(
    row['Village Code'] ??
      row['Census Code'] ??
      row['Town/Village Code'] ??
      row['village_code'],
  );

  if (!villageCode) throw new Error('Missing Village Code');

  return {
    villageCode,
    hasPrimarySchool: safeBool(
      row['Primary School'] ?? row['primary_school'] ?? row['Prim_Sch'],
    ),
    hasMiddleSchool: safeBool(
      row['Middle School'] ?? row['middle_school'] ?? row['Mid_Sch'],
    ),
    hasHighSchool: safeBool(
      row['High School'] ?? row['Secondary School'] ?? row['high_school'] ?? row['Sec_Sch'],
    ),
    hasPHC: safeBool(
      row['Primary Health Centre'] ?? row['PHC'] ?? row['phc'] ?? row['Health Centre'],
    ),
    hasPostOffice: safeBool(
      row['Post Office'] ?? row['post_office'] ?? row['Post_off'],
    ),
    hasBankBranch: safeBool(
      row['Bank Branch'] ?? row['Commercial Bank'] ?? row['bank_branch'] ?? row['Comm_Bank'],
    ),
    hasATM: safeBool(row['ATM'] ?? row['atm']),
    hasElectricity: safeBool(
      row['Electricity'] ?? row['Power Supply'] ?? row['electricity'] ?? row['Elec_Dom'],
    ),
    hasBusService: safeBool(
      row['Bus Service'] ?? row['bus_service'] ?? row['Bus_Srv'],
    ),
    hasRailway: safeBool(
      row['Railway Station'] ?? row['railway'] ?? row['Rail_Stn'],
    ),
    hasMobileNetwork: safeBool(
      row['Mobile Coverage'] ?? row['mobile_network'] ?? row['Mob_Cov'],
    ),
    hasInternet: safeBool(
      row['Internet'] ?? row['Internet Cafe'] ?? row['internet'] ?? row['Int_Cafe'],
    ),
    nearestTownKm: safeFloat(
      row['Nearest Town Distance'] ??
        row['Dist to Town'] ??
        row['nearest_town_km'] ??
        row['Dist_Near_Town'],
    ),
  };
}

function validateRow(record: AmenityRow, _index: number): string[] {
  const errors: string[] = [];
  if (record.villageCode <= 0) errors.push('Invalid village code');
  return errors;
}

export class AmenitiesPipeline implements DataPipeline {
  readonly source = 'amenities' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<AmenityRow>(filePath, transformRow, validateRow);

    return processRecords<AmenityRow>(
      'amenities',
      records,
      async (data, tx) => {
        // Check village exists
        const village = await tx.village.findUnique({
          where: { id: data.villageCode },
        });

        if (!village) return 'skipped';

        await tx.villageAmenity.upsert({
          where: { villageId: data.villageCode },
          create: {
            villageId: data.villageCode,
            hasPrimarySchool: data.hasPrimarySchool,
            hasMiddleSchool: data.hasMiddleSchool,
            hasHighSchool: data.hasHighSchool,
            hasPHC: data.hasPHC,
            hasPostOffice: data.hasPostOffice,
            hasBankBranch: data.hasBankBranch,
            hasATM: data.hasATM,
            hasElectricity: data.hasElectricity,
            hasBusService: data.hasBusService,
            hasRailway: data.hasRailway,
            hasMobileNetwork: data.hasMobileNetwork,
            hasInternet: data.hasInternet,
            nearestTownKm: data.nearestTownKm ?? null,
            source: 'CENSUS',
            censusYear: 2011,
          },
          update: {
            hasPrimarySchool: data.hasPrimarySchool ?? undefined,
            hasMiddleSchool: data.hasMiddleSchool ?? undefined,
            hasHighSchool: data.hasHighSchool ?? undefined,
            hasPHC: data.hasPHC ?? undefined,
            hasPostOffice: data.hasPostOffice ?? undefined,
            hasBankBranch: data.hasBankBranch ?? undefined,
            hasATM: data.hasATM ?? undefined,
            hasElectricity: data.hasElectricity ?? undefined,
            hasBusService: data.hasBusService ?? undefined,
            hasRailway: data.hasRailway ?? undefined,
            hasMobileNetwork: data.hasMobileNetwork ?? undefined,
            hasInternet: data.hasInternet ?? undefined,
            nearestTownKm: data.nearestTownKm ?? undefined,
          },
        });

        return 'inserted';
      },
      this.prisma,
      options,
    );
  }
}
