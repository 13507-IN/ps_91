import type { PrismaClient, BusinessCategory } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeInt, safeFloat, cleanString } from '../utils.js';

// ============================================================
// UDYAM / MSME Pipeline
// Ingests: Formally registered businesses from UDYAM/MSME data
// Source: data.gov.in UDYAM registration data
// ============================================================

interface UdyamRow {
  registrationId: string;
  name: string | null;
  category: BusinessCategory;
  subcategory: string | null;
  districtName: string | null;
  villageName: string | null;
  villageCode: number | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  scale: 'MICRO' | 'SMALL' | 'MEDIUM' | null;
  nicCode: string | null;
  products: string[];
}

/** Map NIC (National Industrial Classification) codes to our business categories */
function nicToCategory(nicCode: string | null | undefined, description: string | null): BusinessCategory {
  if (!nicCode && !description) return 'OTHER';

  const code = nicCode?.trim() ?? '';
  const desc = (description ?? '').toLowerCase();

  // Dairy
  if (code.startsWith('0141') || desc.includes('dairy') || desc.includes('milk')) return 'DAIRY';
  // Food processing
  if (
    code.startsWith('10') ||
    code.startsWith('11') ||
    desc.includes('food') ||
    desc.includes('bakery') ||
    desc.includes('grain')
  )
    return 'FOOD_PROCESSING';
  // Retail
  if (code.startsWith('47') || code.startsWith('46') || desc.includes('retail') || desc.includes('shop'))
    return 'RETAIL';
  // Textiles
  if (
    code.startsWith('13') ||
    code.startsWith('14') ||
    desc.includes('textile') ||
    desc.includes('tailor') ||
    desc.includes('garment')
  )
    return 'TEXTILES_TAILORING';
  // Poultry
  if (code.startsWith('0146') || desc.includes('poultry') || desc.includes('chicken'))
    return 'POULTRY';
  // Agriculture
  if (code.startsWith('01') || desc.includes('agriculture') || desc.includes('crop'))
    return 'AGRICULTURE';
  // Livestock
  if (code.startsWith('014') || desc.includes('livestock') || desc.includes('cattle'))
    return 'LIVESTOCK';
  // Transport
  if (code.startsWith('49') || desc.includes('transport') || desc.includes('vehicle'))
    return 'TRANSPORT';
  // Handicraft
  if (desc.includes('handicraft') || desc.includes('craft') || desc.includes('artisan'))
    return 'HANDICRAFT';
  // Services
  if (
    code.startsWith('56') ||
    code.startsWith('96') ||
    desc.includes('service') ||
    desc.includes('repair')
  )
    return 'SERVICES';

  return 'OTHER';
}

function transformRow(row: Record<string, unknown>, _index: number): UdyamRow {
  const r = row as Record<string, string | number>;
  const registrationId = cleanString(
    r['UDYAM Registration Number'] ??
      r['Registration No'] ??
      r['udyam_registration_number'] ??
      r['udyam_id'] ??
      r['registrationId'],
  );

  if (!registrationId) {
    throw new Error('Missing UDYAM Registration Number');
  }

  const name = cleanString(
    r['Enterprise Name'] ?? r['Name of Enterprise'] ?? r['enterprise_name'] ?? r['name'],
  );

  const nicCode = cleanString(r['NIC Code'] ?? r['NIC 2 Digit Code'] ?? r['nic_code']);
  const description = cleanString(
    r['Activity Description'] ??
      r['Major Activity'] ??
      r['subcategory'] ??
      r['activity_description'],
  );

  const categoryRaw = cleanString(r['Category'] ?? r['category']);
  const validCategories: BusinessCategory[] = [
    'AGRICULTURE',
    'LIVESTOCK',
    'DAIRY',
    'POULTRY',
    'FOOD_PROCESSING',
    'TEXTILES_TAILORING',
    'HANDICRAFT',
    'RETAIL',
    'SERVICES',
    'TRANSPORT',
    'MANUFACTURING',
    'OTHER',
  ];
  let category: BusinessCategory;
  if (categoryRaw && validCategories.includes(categoryRaw as BusinessCategory)) {
    category = categoryRaw as BusinessCategory;
  } else {
    category = nicToCategory(nicCode, description);
  }

  const scaleRaw = cleanString(
    r['Enterprise Type'] ?? r['Type of Enterprise'] ?? r['enterprise_type'] ?? r['scale'],
  );
  let scale: 'MICRO' | 'SMALL' | 'MEDIUM' | null = null;
  if (scaleRaw) {
    const s = scaleRaw.toUpperCase();
    if (s.includes('MICRO')) scale = 'MICRO';
    else if (s.includes('SMALL')) scale = 'SMALL';
    else if (s.includes('MEDIUM')) scale = 'MEDIUM';
  }

  const productsRaw = cleanString(
    r['Products/Services'] ?? r['Major Products'] ?? r['products'],
  );

  return {
    registrationId,
    name,
    category,
    subcategory: description,
    districtName: cleanString(r['District'] ?? r['district_name'] ?? r['district']),
    villageName: cleanString(
      r['Village'] ?? r['City/Village'] ?? r['village_name'] ?? r['village'],
    ),
    villageCode: safeInt(r['Village Code'] ?? r['village_code']),
    latitude: safeFloat(r['latitude'] ?? r['lat']),
    longitude: safeFloat(r['longitude'] ?? r['lng'] ?? r['lon']),
    scale,
    nicCode,
    products: productsRaw ? productsRaw.split(/[,;]/).map((p) => p.trim()).filter(Boolean) : [],
  };
}

function validateRow(record: UdyamRow, _index: number): string[] {
  const errors: string[] = [];
  if (!record.registrationId) errors.push('Missing registration ID');
  return errors;
}

export class UdyamPipeline implements DataPipeline {
  readonly source = 'udyam' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<UdyamRow>(filePath, transformRow, validateRow);

    return processRecords<UdyamRow>(
      'udyam',
      records,
      async (data, tx) => {
        // Try to resolve village by code or name
        let villageId: number | null = null;

        if (data.villageCode) {
          const village = await tx.village.findUnique({
            where: { id: data.villageCode },
          });
          if (village) villageId = village.id;
        }

        // Check for duplicate registration
        const existing = await tx.business.findFirst({
          where: { registrationId: data.registrationId },
        });

        if (existing) {
          await tx.business.update({
            where: { id: existing.id },
            data: {
              name: data.name ?? existing.name,
              category: data.category,
              subcategory: data.subcategory,
              products: data.products.length > 0 ? data.products : existing.products,
              latitude: data.latitude ?? existing.latitude,
              longitude: data.longitude ?? existing.longitude,
              scale: data.scale,
              source: 'UDYAM',
              verificationStatus: 'VERIFIED',
            },
          });
          return 'updated';
        }

        await tx.business.create({
          data: {
            villageId,
            name: data.name,
            category: data.category,
            subcategory: data.subcategory,
            products: data.products,
            latitude: data.latitude,
            longitude: data.longitude,
            operatingStatus: 'ACTIVE',
            scale: data.scale,
            source: 'UDYAM',
            verificationStatus: 'VERIFIED',
            confidence: 'HIGH',
            registrationId: data.registrationId,
          },
        });

        return 'inserted';
      },
      this.prisma,
      options,
    );
  }
}
