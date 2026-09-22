import { describe, it, expect, vi } from 'vitest';
import { BusinessService } from './business.service.js';
import type { PrismaClient } from '@prisma/client';

describe('BusinessService', () => {
  const mockPrisma = {
    business: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient;

  const service = new BusinessService(mockPrisma);

  it('lists business categories with correct domain metadata', () => {
    const categories = service.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(5);

    const dairy = categories.find((c) => c.code === 'DAIRY');
    expect(dairy).toBeDefined();
    expect(dairy?.name).toContain('Dairy');
    expect(dairy?.typicalInvestmentRange.min).toBeGreaterThan(0);
    expect(dairy?.defaultMarginPct).toBe(10);
  });

  it('lists businesses with pagination', async () => {
    (mockPrisma.business.count as ReturnType<typeof vi.fn>).mockResolvedValueOnce(1);
    (mockPrisma.business.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 'b1',
        name: 'Maa Tara Sweets & Dairy',
        category: 'DAIRY',
        products: ['Milk', 'Paneer', 'Sweets'],
      },
    ]);

    const result = await service.listBusinesses({ page: 1, limit: 20 });
    expect(result.total).toBe(1);
    expect(result.businesses).toHaveLength(1);
    expect(result.businesses[0]?.name).toBe('Maa Tara Sweets & Dairy');
  });

  it('creates new crowdsourced business with UNVERIFIED status', async () => {
    (mockPrisma.business.create as ReturnType<typeof vi.fn>).mockImplementationOnce(({ data }) =>
      Promise.resolve({ id: 'new-id', ...data }),
    );

    const created = await service.createBusiness({
      name: 'Local Tailoring Shop',
      category: 'TEXTILES_TAILORING',
      products: ['Blouse stitching', 'School uniforms'],
      source: 'COMMUNITY_REPORT',
    });

    expect(created.name).toBe('Local Tailoring Shop');
    expect(created.verificationStatus).toBe('UNVERIFIED');
    expect(created.confidence).toBe('MEDIUM');
    expect(created.validationsCount).toBe(1);
  });

  it('keeps business UNVERIFIED when validations < 10', async () => {
    (mockPrisma.business as any).findUnique = vi.fn().mockResolvedValueOnce({
      id: 'b-pending',
      validationsCount: 5,
      flagsCount: 0,
      verificationStatus: 'UNVERIFIED',
      confidence: 'MEDIUM',
    });
    (mockPrisma.business as any).update = vi.fn().mockImplementationOnce(({ data }) =>
      Promise.resolve({
        id: 'b-pending',
        ...data,
      }),
    );
    (mockPrisma as any).businessVerification = { create: vi.fn().mockResolvedValue({}) };

    const result = await service.verifyBusiness('b-pending', 'user-1', 'CONFIRM');
    expect(result.validationsCount).toBe(6);
    expect(result.verificationStatus).toBe('UNVERIFIED');
    expect(result.isVerified).toBe(false);
    expect(result.remainingValidations).toBe(4);
    expect(result.progressPct).toBe(60);
  });

  it('promotes business to VERIFIED when reaching 10 validations', async () => {
    (mockPrisma.business as any).findUnique = vi.fn().mockResolvedValueOnce({
      id: 'b-pending',
      validationsCount: 9,
      flagsCount: 0,
      verificationStatus: 'UNVERIFIED',
      confidence: 'MEDIUM',
    });
    (mockPrisma.business as any).update = vi.fn().mockImplementationOnce(({ data }) =>
      Promise.resolve({
        id: 'b-pending',
        ...data,
      }),
    );
    (mockPrisma as any).businessVerification = { create: vi.fn().mockResolvedValue({}) };

    const result = await service.verifyBusiness('b-pending', 'user-10', 'CONFIRM');
    expect(result.validationsCount).toBe(10);
    expect(result.verificationStatus).toBe('VERIFIED');
    expect(result.confidence).toBe('HIGH');
    expect(result.isVerified).toBe(true);
    expect(result.remainingValidations).toBe(0);
    expect(result.progressPct).toBe(100);
  });
});
