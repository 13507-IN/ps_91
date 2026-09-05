import type { PrismaClient } from '@prisma/client';
import type { DataPipeline, IngestionResult } from '../types.js';
import { parseCsvFile } from '../parsers/index.js';
import { processRecords, safeFloat, cleanString } from '../utils.js';

// ============================================================
// AGMARKNET Pipeline
// Ingests: Daily commodity prices from mandis (agricultural markets)
// Source: data.gov.in AGMARKNET daily price data
// ============================================================

interface AgmarknetRow {
  commodity: string;
  variety: string | null;
  market: string;
  district: string;
  state: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  modalPrice: number | undefined;
  unit: string;
  date: Date;
}

function parseDate(raw: string | null | undefined): Date {
  if (!raw) return new Date();
  const trimmed = raw.trim();

  // Handle dd/mm/yyyy format (common in Indian government data)
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    return new Date(
      parseInt(ddmmyyyy[3]!, 10),
      parseInt(ddmmyyyy[2]!, 10) - 1,
      parseInt(ddmmyyyy[1]!, 10),
    );
  }

  // Handle yyyy-mm-dd
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed;

  return new Date();
}

function transformRow(row: Record<string, string>, _index: number): AgmarknetRow {
  const commodity = cleanString(
    row['Commodity'] ?? row['commodity'] ?? row['Commodity Name'],
  );
  const market = cleanString(
    row['Market'] ?? row['market'] ?? row['Market Name'] ?? row['Market Centre'],
  );
  const district = cleanString(
    row['District'] ?? row['district'] ?? row['District Name'],
  );
  const state = cleanString(
    row['State'] ?? row['state'] ?? row['State Name'],
  );

  if (!commodity) throw new Error('Missing Commodity');
  if (!market) throw new Error('Missing Market');
  if (!district) throw new Error('Missing District');
  if (!state) throw new Error('Missing State');

  return {
    commodity,
    variety: cleanString(row['Variety'] ?? row['variety'] ?? row['Grade']),
    market,
    district,
    state,
    minPrice: safeFloat(
      row['Min Price'] ?? row['Min_Price'] ?? row['min_price'] ?? row['Minimum Price'],
    ),
    maxPrice: safeFloat(
      row['Max Price'] ?? row['Max_Price'] ?? row['max_price'] ?? row['Maximum Price'],
    ),
    modalPrice: safeFloat(
      row['Modal Price'] ?? row['Modal_Price'] ?? row['modal_price'],
    ),
    unit: cleanString(row['Unit'] ?? row['unit']) ?? 'Quintal',
    date: parseDate(
      row['Arrival Date'] ?? row['Price Date'] ?? row['Date'] ?? row['arrival_date'],
    ),
  };
}

function validateRow(record: AgmarknetRow, _index: number): string[] {
  const errors: string[] = [];
  if (!record.commodity) errors.push('Missing commodity');
  if (!record.market) errors.push('Missing market');
  // At least one price should be present
  if (!record.minPrice && !record.maxPrice && !record.modalPrice) {
    errors.push('No price data');
  }
  return errors;
}

export class AgmarknetPipeline implements DataPipeline {
  readonly source = 'agmarknet' as const;

  constructor(private readonly prisma: PrismaClient) {}

  async run(
    filePath: string,
    options?: { dryRun?: boolean; batchSize?: number },
  ): Promise<IngestionResult> {
    const records = await parseCsvFile<AgmarknetRow>(filePath, transformRow, validateRow);

    return processRecords<AgmarknetRow>(
      'agmarknet',
      records,
      async (data, tx) => {
        // Check for duplicate: same commodity, market, date
        const existing = await tx.commodityPrice.findFirst({
          where: {
            commodity: data.commodity,
            market: data.market,
            date: data.date,
            variety: data.variety ?? undefined,
          },
        });

        if (existing) {
          await tx.commodityPrice.update({
            where: { id: existing.id },
            data: {
              minPrice: data.minPrice ?? existing.minPrice,
              maxPrice: data.maxPrice ?? existing.maxPrice,
              modalPrice: data.modalPrice ?? existing.modalPrice,
            },
          });
          return 'updated';
        }

        await tx.commodityPrice.create({
          data: {
            commodity: data.commodity,
            variety: data.variety,
            market: data.market,
            district: data.district,
            state: data.state,
            minPrice: data.minPrice ?? null,
            maxPrice: data.maxPrice ?? null,
            modalPrice: data.modalPrice ?? null,
            unit: data.unit,
            date: data.date,
            source: 'AGMARKNET',
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
