import { describe, it, expect, vi } from 'vitest';
import { LocationService } from './location.service.js';
import type { PrismaClient } from '@prisma/client';

describe('LocationService', () => {
  const mockPrisma = {
    village: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient;

  const service = new LocationService(mockPrisma);

  it('searches villages by name and maps hierarchy correctly', async () => {
    (mockPrisma.village.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 101,
        name: 'Krishnanagar',
        nameLocal: 'কৃষ্ণনগর',
        latitude: 23.4,
        longitude: 88.5,
        block: {
          name: 'Krishnanagar I',
          district: {
            name: 'Nadia',
            state: { name: 'West Bengal' },
          },
        },
        censusData: {
          totalPopulation: 25000,
          totalHouseholds: 5000,
        },
      },
    ]);

    const results = await service.searchVillages('Krishna', 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('Krishnanagar');
    expect(results[0]?.districtName).toBe('Nadia');
    expect(results[0]?.stateName).toBe('West Bengal');
    expect(results[0]?.totalPopulation).toBe(25000);
  });

  it('retrieves detailed village profile', async () => {
    (mockPrisma.village.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 101,
      name: 'Krishnanagar',
      block: {
        name: 'Krishnanagar I',
        district: {
          name: 'Nadia',
          state: { name: 'West Bengal' },
        },
      },
      censusData: { totalPopulation: 25000 },
      amenities: { hasElectricity: true, hasBankBranch: true },
      livestock: [],
      crops: [],
      roads: [],
      businesses: [],
    });

    const village = await service.getVillageById(101);
    expect(village.id).toBe(101);
    expect(village.amenities?.hasElectricity).toBe(true);
  });

  it('throws NotFoundError if village does not exist', async () => {
    (mockPrisma.village.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(service.getVillageById(99999)).rejects.toThrow('Village with ID 99999 not found');
  });

  it('uses Haversine fallback to compute nearby villages when PostGIS raw query fails', async () => {
    (mockPrisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('PostGIS extension not loaded'),
    );

    (mockPrisma.village.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 101,
        name: 'Nearby Village',
        nameLocal: null,
        latitude: 23.405,
        longitude: 88.505,
        block: {
          name: 'Block A',
          district: {
            name: 'Nadia',
            state: { name: 'West Bengal' },
          },
        },
        censusData: { totalPopulation: 1200, totalHouseholds: 250 },
      },
    ]);

    const results = await service.getNearbyVillages(23.4, 88.5, 10, 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('Nearby Village');
    expect(results[0]?.distanceKm).toBeLessThan(10);
  });
});
