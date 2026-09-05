import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { runAllPipelines } from '../src/ingestion/runner.js';
import type { IngestionSource } from '../src/ingestion/types.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Nadia Pilot District...');

  const seedsDir = path.resolve(process.cwd(), 'src/ingestion/seeds/nadia');

  const fileMap: Partial<Record<IngestionSource, string>> = {
    lgd: path.join(seedsDir, 'lgd.json'),
    census: path.join(seedsDir, 'census.csv'),
    amenities: path.join(seedsDir, 'amenities.csv'),
    udyam: path.join(seedsDir, 'udyam.csv'),
    livestock: path.join(seedsDir, 'livestock.csv'),
    crop: path.join(seedsDir, 'crop.csv'),
    agmarknet: path.join(seedsDir, 'agmarknet.csv'),
    roads: path.join(seedsDir, 'roads.csv'),
  };

  const results = await runAllPipelines(fileMap, prisma, { batchSize: 100 });

  console.log('\n📊 Seeding Results Summary:');
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

  console.log('\n✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
