import { existsSync } from 'node:fs';
import path from 'node:path';
import { runAllPipelines } from '../src/ingestion/runner.js';
import type { IngestionSource } from '../src/ingestion/types.js';
import { seedDemoUsers } from '../src/ingestion/seeds/demo_users/index.js';
import { createPrismaClient } from '../src/plugins/prisma.js';

const prisma = createPrismaClient();

/**
 * Districts available for seeding. Add a new entry to extend the pilot
 * (data lives under `src/ingestion/seeds/<key>`).
 */
const DISTRICTS: { key: string; label: string }[] = [
  { key: 'nadia', label: 'Nadia Pilot District' },
  { key: 'bankura', label: 'Bankura District' },
];

const FILE_MAP: Record<IngestionSource, string> = {
  lgd: 'lgd.json',
  census: 'census.csv',
  amenities: 'amenities.csv',
  udyam: 'udyam.csv',
  livestock: 'livestock.csv',
  crop: 'crop.csv',
  agmarknet: 'agmarknet.csv',
  roads: 'roads.csv',
};

async function seedDistrict(district: { key: string; label: string }): Promise<void> {
  const seedsDir = path.resolve(process.cwd(), `src/ingestion/seeds/${district.key}`);

  const fileMap: Partial<Record<IngestionSource, string>> = {};
  for (const [source, fileName] of Object.entries(FILE_MAP)) {
    const filePath = path.join(seedsDir, fileName);
    if (existsSync(filePath)) {
      fileMap[source as IngestionSource] = filePath;
    }
  }

  const results = await runAllPipelines(fileMap, prisma, { batchSize: 100 });

  console.log(`\n Seeding Results Summary: ${district.label}`);
  console.table(
    results.map((r) => ({
      Source: r.source,
      Status: r.status,
      Total: r.totalRows,
      Inserted: r.inserted,
      Updated: r.updated,
      Errors: r.errors,
      'Time (ms)': r.durationMs,
    })),
  );
}

async function main() {
  console.log(' Starting database seeding...');

  for (const district of DISTRICTS) {
    const seedsDir = path.resolve(process.cwd(), `src/ingestion/seeds/${district.key}`);
    if (!existsSync(seedsDir)) {
      console.log(`\n  Skipping "${district.label}" — seed directory not found: ${seedsDir}`);
      continue;
    }
    console.log(`\n--- Seeding ${district.label} ---`);
    await seedDistrict(district);
  }

  console.log('\n Database seeding finished successfully!');

  // Seed demo users for UI testing
  await seedDemoUsers(prisma);
}

main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });