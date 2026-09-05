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
  });
});
