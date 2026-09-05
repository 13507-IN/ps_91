import { describe, it, expect, vi } from 'vitest';
import { MarketService } from './market.service.js';
import type { PrismaClient } from '@prisma/client';

describe('MarketService', () => {
  const mockPrisma = {
    village: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    censusData: {
      findMany: vi.fn(),
    },
    villageAmenity: {
      findMany: vi.fn(),
    },
    cropData: {
      findMany: vi.fn(),
    },
    livestockData: {
      findMany: vi.fn(),
    },
    business: {
      findMany: vi.fn(),
    },
    commodityPrice: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient;

  const service = new MarketService(mockPrisma);

  it('aggregates market intelligence across catchment villages', async () => {
    // Mock nearby villages
    (mockPrisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 1,
        name: 'Village A',
        latitude: 23.4,
        longitude: 88.5,
        totalHouseholds: 200,
        totalPopulation: 1000,
      },
      {
        id: 2,
        name: 'Village B',
        latitude: 23.41,
        longitude: 88.51,
        totalHouseholds: 300,
        totalPopulation: 1500,
      },
    ]);

    // Mock census
    (mockPrisma.censusData.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        villageId: 1,
        totalPopulation: 1000,
        totalHouseholds: 200,
        malePopulation: 520,
        femalePopulation: 480,
        scPopulation: 150,
        stPopulation: 20,
        literacyRate: 75.5,
        workingPopulation: 450,
        mainWorkers: 350,
        marginalWorkers: 100,
        agriculturalLabourers: 200,
        cultivators: 150,
        householdWorkers: 20,
        otherWorkers: 80,
      },
      {
        villageId: 2,
        totalPopulation: 1500,
        totalHouseholds: 300,
        malePopulation: 770,
        femalePopulation: 730,
        scPopulation: 200,
        stPopulation: 50,
        literacyRate: 80.5,
        workingPopulation: 600,
        mainWorkers: 500,
        marginalWorkers: 100,
        agriculturalLabourers: 250,
        cultivators: 200,
        householdWorkers: 30,
        otherWorkers: 120,
      },
    ]);

    // Mock amenities
    (mockPrisma.villageAmenity.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { villageId: 1, hasElectricity: true, hasBankBranch: false },
      { villageId: 2, hasElectricity: true, hasBankBranch: true },
    ]);

    // Mock crops
    (mockPrisma.cropData.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { cropName: 'Paddy', areaHectares: 120, productionTonnes: 350 },
      { cropName: 'Jute', areaHectares: 80, productionTonnes: 200 },
    ]);

    // Mock livestock
    (mockPrisma.livestockData.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { animalType: 'Cattle', count: 450, milkProducing: 220 },
      { animalType: 'Goat', count: 300, milkProducing: 0 },
    ]);

    const intel = await service.getMarketIntelligence(23.4, 88.5, 10, 'DAIRY');

    expect(intel.demographics.totalPopulation).toBe(2500);
    expect(intel.demographics.totalHouseholds).toBe(500);
    expect(intel.demographics.malePopulation).toBe(1290);
    expect(intel.demographics.femalePopulation).toBe(1210);
    expect(intel.amenities.villagesWithElectricity).toBe(2);
    expect(intel.amenities.villagesWithBankBranch).toBe(1);
    expect(intel.topCrops[0]?.cropName).toBe('Paddy');
    expect(intel.livestock[0]?.animalType).toBe('Cattle');
    expect(intel.confidence).toBe('HIGH');
  });

  it('computes competitor analysis with observed vs inferred breakdown', async () => {
    (mockPrisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, totalHouseholds: 500 },
    ]);

    (mockPrisma.business.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 'b1',
        name: 'Nadia Dairy Co-op',
        category: 'DAIRY',
        source: 'UDYAM',
        verificationStatus: 'VERIFIED',
      },
      {
        id: 'b2',
        name: 'Local Milk Seller',
        category: 'DAIRY',
        source: 'COMMUNITY_REPORT',
        verificationStatus: 'UNVERIFIED',
      },
    ]);

    const comp = await service.getCompetitorAnalysis(23.4, 88.5, 10, 'DAIRY');

    expect(comp.totalObserved).toBe(1);
    expect(comp.totalReported).toBe(1);
    expect(comp.estimatedInferredMin).toBeGreaterThan(0);
    expect(comp.totalEstimatedMin).toBeGreaterThan(2);
    expect(comp.densityPerSqKm).toBeGreaterThan(0);
  });
});
