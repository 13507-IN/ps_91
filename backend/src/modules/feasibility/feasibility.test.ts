import { describe, it, expect, vi } from 'vitest';
import { FeasibilityService } from './feasibility.service.js';
import type { PrismaClient } from '@prisma/client';
import { BusinessCategory, Gender, SocialCategory } from '@prisma/client';

describe('FeasibilityService', () => {
  const mockPrisma = {
    village: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
    },
    censusData: {
      findMany: vi.fn().mockResolvedValue([
        {
          villageId: 1,
          totalPopulation: 3500,
          totalHouseholds: 700,
          malePopulation: 1800,
          femalePopulation: 1700,
          literacyRate: 78,
          workingPopulation: 1200,
          mainWorkers: 950,
          marginalWorkers: 250,
          agriculturalLabourers: 400,
          cultivators: 300,
          householdWorkers: 50,
          otherWorkers: 200,
        },
      ]),
    },
    villageAmenity: {
      findMany: vi.fn().mockResolvedValue([
        { villageId: 1, hasElectricity: true, hasBankBranch: true },
      ]),
    },
    cropData: {
      findMany: vi.fn().mockResolvedValue([
        { cropName: 'Paddy', areaHectares: 100, productionTonnes: 300 },
      ]),
    },
    livestockData: {
      findMany: vi.fn().mockResolvedValue([
        { animalType: 'Cattle', count: 400, milkProducing: 200 },
      ]),
    },
    business: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'b1',
          name: 'Nadia Milk Point',
          category: 'DAIRY',
          source: 'UDYAM',
          verificationStatus: 'VERIFIED',
        },
      ]),
      count: vi.fn().mockResolvedValue(1),
    },
    commodityPrice: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    analysis: {
      create: vi.fn().mockResolvedValue({ id: 'analysis-123' }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    $queryRaw: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Krishnanagar Village',
        latitude: 23.4,
        longitude: 88.5,
        totalPopulation: 3500,
        totalHouseholds: 700,
        distanceKm: 2.5,
      },
    ]),
  } as unknown as PrismaClient;

  const service = new FeasibilityService(mockPrisma);

  it('runs full feasibility analysis pipeline from capital and idea', async () => {
    const analysis = await service.analyze({
      latitude: 23.4,
      longitude: 88.5,
      businessIdea: 'Starting a small dairy unit with 3 milch cows and doorstep delivery',
      availableCapital: 40000,
      age: 26,
      gender: Gender.FEMALE,
      category: SocialCategory.SC,
    });

    expect(analysis.businessCategory).toBe(BusinessCategory.DAIRY);
    expect(analysis.financialPlan.projectCost).toBe(400000); // 40,000 / 10%
    expect(analysis.financialPlan.loanRequired).toBe(360000);
    expect(analysis.financialPlan.emi.emi).toBeGreaterThan(0);
    expect(analysis.schemeMatches.length).toBeGreaterThan(0);
    expect(analysis.feasibilityScore.totalScore).toBeGreaterThan(50);
    expect(analysis.feasibilityScore.grade).toBeDefined();
    expect(analysis.aiRecommendation.decision).toBeDefined();
    expect(analysis.actionPlan).toBeDefined();
    expect(analysis.status).toBe('COMPLETED');
  });

  it('persists analysis to database when userId is provided', async () => {
    const analysis = await service.analyze(
      {
        latitude: 23.4,
        longitude: 88.5,
        businessCategory: BusinessCategory.RETAIL,
        businessIdea: 'Grocery shop in village',
        availableCapital: 30000,
      },
      'user-cuid-123',
    );

    expect(analysis.id).toBe('analysis-123');
    expect(mockPrisma.analysis.create).toHaveBeenCalled();
  });

  it('correctly resolves real village and district in listUserAnalyses without hardcoding Nadia Rural', async () => {
    (mockPrisma.analysis.findMany as any).mockResolvedValueOnce([
      {
        id: 'ana-1',
        businessCategory: BusinessCategory.DAIRY,
        businessIdea: 'Dairy unit in Jhikra, Nadia with milk chilling',
        availableCapital: 50000,
        catchmentRadiusKm: 10,
        latitude: 23.4,
        longitude: 88.5,
        villageId: 101,
        status: 'COMPLETED',
        confidence: 'HIGH',
        feasibilityScore: { totalScore: 82 },
        opportunityAnalysis: { villageName: 'Jhikra', districtName: 'Nadia' },
        createdAt: new Date('2026-03-20T10:00:00Z'),
      },
      {
        id: 'ana-2',
        businessCategory: BusinessCategory.POULTRY,
        businessIdea: 'Poultry farm in Nekrisole, Bankura',
        availableCapital: 60000,
        catchmentRadiusKm: 10,
        latitude: 23.1,
        longitude: 87.1,
        villageId: null,
        status: 'COMPLETED',
        confidence: 'MEDIUM',
        feasibilityScore: { totalScore: 75 },
        opportunityAnalysis: null,
        createdAt: new Date('2026-03-21T10:00:00Z'),
      },
    ]);

    (mockPrisma.village.findMany as any).mockResolvedValueOnce([
      {
        id: 101,
        name: 'Jhikra',
        block: {
          name: 'Krishnanagar-II',
          district: {
            name: 'Nadia',
            state: { name: 'West Bengal' },
          },
        },
      },
    ]);

    const list = await service.listUserAnalyses('user-cuid-123');
    expect(list).toHaveLength(2);
    expect(list[0].villageName).toBe('Jhikra');
    expect(list[0].district).toBe('Nadia');
    expect(list[1].villageName).toBe('Nekrisole');
    expect(list[1].district).toBe('Bankura');
  });
});

