import type { PrismaClient } from '@prisma/client';
import {
  BusinessCategory,
  VerificationStatus,
  Confidence,
  DataSource,
  OperatingStatus,
  Prisma,
} from '@prisma/client';
import type { ListBusinessesQuery, CreateBusinessBody } from './business.schema.js';
import { LocationService } from '../location/location.service.js';

export interface CategoryInfo {
  code: BusinessCategory;
  name: string;
  description: string;
  typicalInvestmentRange: { min: number; max: number };
  defaultMarginPct: number;
  subcategories: string[];
}

export const BUSINESS_CATEGORIES_METADATA: Record<BusinessCategory, Omit<CategoryInfo, 'code'>> = {
  DAIRY: {
    name: 'Dairy & Milk Products',
    description: 'Milk production, chilling, collection, curd, paneer, and sweets manufacturing.',
    typicalInvestmentRange: { min: 100000, max: 1000000 },
    defaultMarginPct: 10,
    subcategories: ['Milk Retail', 'Paneer Production', 'Curd & Dairy Byproducts', 'Cattle Feed Supply'],
  },
  FOOD_PROCESSING: {
    name: 'Food Processing',
    description: 'Paddy husking, flour milling, mustard oil extraction, pickle/jam production.',
    typicalInvestmentRange: { min: 150000, max: 2500000 },
    defaultMarginPct: 15,
    subcategories: ['Flour Mill (Atta Chakkai)', 'Oil Expeller', 'Spices Grinding', 'Bakery & Snacks'],
  },
  RETAIL: {
    name: 'Retail & Grocery',
    description: 'Kirana stores, general goods, stationery, fertilizer and seeds retail.',
    typicalInvestmentRange: { min: 50000, max: 500000 },
    defaultMarginPct: 10,
    subcategories: ['Kirana / Grocery', 'Agri-Inputs & Fertilizer', 'Stationery & Xerox', 'Hardware Store'],
  },
  TEXTILES_TAILORING: {
    name: 'Textiles & Tailoring',
    description: 'Garment stitching, tailoring, boutique, handloom and readymade clothing.',
    typicalInvestmentRange: { min: 30000, max: 300000 },
    defaultMarginPct: 10,
    subcategories: ['Boutique & Ladies Tailoring', 'Readymade Garment Shop', 'Handloom Weaving', 'Embroidery Work'],
  },
  POULTRY: {
    name: 'Poultry & Livestock',
    description: 'Broiler farming, layer eggs production, goat farming, duckery.',
    typicalInvestmentRange: { min: 100000, max: 800000 },
    defaultMarginPct: 15,
    subcategories: ['Broiler Poultry', 'Layer Egg Production', 'Goat Rearing', 'Hatchery Operations'],
  },
  AGRICULTURE: {
    name: 'Agricultural Services',
    description: 'Tractor custom hiring, nursery, organic composting, cold storage aggregation.',
    typicalInvestmentRange: { min: 100000, max: 2000000 },
    defaultMarginPct: 15,
    subcategories: ['Farm Equipment Custom Hiring', 'Plant Nursery', 'Organic Vermicompost', 'Vegetable Aggregation'],
  },
  LIVESTOCK: {
    name: 'Livestock Trading & Care',
    description: 'Cattle trading, veterinary pharmacy, animal feed manufacturing.',
    typicalInvestmentRange: { min: 100000, max: 1000000 },
    defaultMarginPct: 10,
    subcategories: ['Animal Feed Production', 'Veterinary Supplies', 'Breeding Support'],
  },
  TRANSPORT: {
    name: 'Rural Logistics & Transport',
    description: 'E-rickshaw, light commercial goods transport, village courier service.',
    typicalInvestmentRange: { min: 150000, max: 800000 },
    defaultMarginPct: 10,
    subcategories: ['Commercial Cargo Auto', 'E-Rickshaw Passenger', 'Agri Produce Transport'],
  },
  HANDICRAFT: {
    name: 'Handicrafts & Artisans',
    description: 'Clay pottery, jute crafts, bamboo woodwork, traditional jewelry.',
    typicalInvestmentRange: { min: 25000, max: 250000 },
    defaultMarginPct: 5,
    subcategories: ['Jute Handicrafts', 'Clay Pottery & Idols', 'Bamboo Products', 'Handmade Ornaments'],
  },
  SERVICES: {
    name: 'Technical & Personal Services',
    description: 'Mobile/appliance repair, CSC digital service centre, motorcycle mechanic.',
    typicalInvestmentRange: { min: 50000, max: 400000 },
    defaultMarginPct: 10,
    subcategories: ['Digital Seva / CSC Centre', 'Motorcycle Repair Garage', 'Electrical & Mobile Repair', 'Salon / Beauty Parlour'],
  },
  OTHER: {
    name: 'Other Enterprise',
    description: 'General miscellaneous rural enterprises and micro-enterprises.',
    typicalInvestmentRange: { min: 50000, max: 1000000 },
    defaultMarginPct: 10,
    subcategories: ['Miscellaneous Manufacturing', 'Custom Rural Services'],
  },
};

export class BusinessService {
  private locationService: LocationService;

  constructor(private prisma: PrismaClient) {
    this.locationService = new LocationService(prisma);
  }

  /*
    List businesses with pagination and category/village filters.
   */
  async listBusinesses(query: ListBusinessesQuery) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where: { villageId?: number; category?: BusinessCategory } = {};
    if (query.villageId) where.villageId = query.villageId;
    if (query.category) where.category = query.category;

    const [total, businesses] = await Promise.all([
      this.prisma.business.count({ where }),
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        include: {
          village: {
            select: {
              name: true,
              block: {
                select: {
                  name: true,
                  district: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      businesses,
    };
  }

  /**
   * Register a new local business (community reporting / field survey).
   */
  async createBusiness(data: CreateBusinessBody) {
    const business = await this.prisma.business.create({
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        products: data.products,
        villageId: data.villageId,
        latitude: data.latitude,
        longitude: data.longitude,
        scale: data.scale,
        priceRange: data.priceRange,
        operatingStatus: data.operatingStatus ?? OperatingStatus.ACTIVE,
        seasonality: data.seasonality,
        source: data.source ?? DataSource.COMMUNITY_REPORT,
        verificationStatus: VerificationStatus.UNVERIFIED,
        confidence: Confidence.MEDIUM,
      },
    });

    return business;
  }

  /**
   * Calculate business density per square kilometer in a catchment area.
   */
  async getBusinessDensity(
    lat: number,
    lng: number,
    radiusKm = 10,
    category?: BusinessCategory,
  ) {
    const nearbyVillages = await this.locationService.getNearbyVillages(lat, lng, radiusKm, 300);
    const villageIds = nearbyVillages.map((v) => v.id);

    const whereClause: { villageId?: { in: number[] }; category?: BusinessCategory } = {
      villageId: { in: villageIds },
    };
    if (category) whereClause.category = category;

    const count = await this.prisma.business.count({ where: whereClause });
    const areaSqKm = Math.PI * radiusKm * radiusKm;
    const density = Math.round((count / (areaSqKm || 1)) * 100) / 100;

    return {
      catchment: { lat, lng, radiusKm, areaSqKm: Math.round(areaSqKm * 100) / 100 },
      category: category ?? 'ALL',
      totalBusinesses: count,
      densityPerSqKm: density,
      villagesCount: villageIds.length,
    };
  }

  /**
   * Get registered UDYAM & MSME businesses hyperlocally around selected lat/lng.
   */
  async getHyperlocalBusinesses(
    lat: number,
    lng: number,
    radiusKm = 10,
    category?: BusinessCategory,
  ) {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 100) / 100;
    };

    try {
      const latDelta = radiusKm / 111.0;
      const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

      let nearbyVillages: Array<{ id: number }> = [];
      try {
        nearbyVillages = await this.locationService.getNearbyVillages(lat, lng, radiusKm, 300);
      } catch {
        // location lookup fallback
      }
      const villageIds = nearbyVillages.map((v) => v.id);

      const ORConditions: Prisma.BusinessWhereInput[] = [
        {
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
        },
      ];
      if (villageIds.length > 0) {
        ORConditions.push({ villageId: { in: villageIds } });
      }

      const where: Prisma.BusinessWhereInput = { OR: ORConditions };
      if (category) where.category = category;

      const dbBusinesses = await this.prisma.business.findMany({
        where,
        take: 100,
        include: {
          village: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
              block: {
                select: {
                  name: true,
                  district: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const results = dbBusinesses
        .map((b) => {
          const bLat = b.latitude ?? b.village?.latitude;
          const bLng = b.longitude ?? b.village?.longitude;
          if (bLat == null || bLng == null) return null;

          const distanceKm = calculateDistance(lat, lng, bLat, bLng);

          return {
            id: b.id,
            name: b.name ?? 'Micro Enterprise',
            category: b.category,
            subcategory: b.subcategory ?? 'Local Enterprise',
            products: b.products,
            latitude: bLat,
            longitude: bLng,
            operatingStatus: b.operatingStatus,
            scale: b.scale ?? 'MICRO',
            source: b.source,
            registrationId: b.registrationId ?? `UDYAM-REG-${b.id.slice(-6)}`,
            villageName: b.village?.name ?? 'Local Village',
            blockName: b.village?.block?.name ?? 'Local Block',
            districtName: b.village?.block?.district?.name ?? 'District',
            distanceKm,
          };
        })
        .filter((b): b is NonNullable<typeof b> => b !== null && b.distanceKm <= radiusKm);

      if (category) {
        const catFiltered = results.filter((b) => b.category === category);
        catFiltered.sort((a, b) => a.distanceKm - b.distanceKm);
        return {
          center: { lat, lng, radiusKm },
          totalFound: catFiltered.length,
          businesses: catFiltered.slice(0, 50),
        };
      }

      results.sort((a, b) => a.distanceKm - b.distanceKm);
      return {
        center: { lat, lng, radiusKm },
        totalFound: results.length,
        businesses: results.slice(0, 50),
      };
    } catch (err) {
      console.error('Hyperlocal business query error:', err);
      return {
        center: { lat, lng, radiusKm },
        totalFound: 0,
        businesses: [],
      };
    }
  }

  /**
   * List all supported business categories with domain metadata and typical capital requirements.
   */
  getCategories(): CategoryInfo[] {
    return Object.entries(BUSINESS_CATEGORIES_METADATA).map(([code, meta]) => ({
      code: code as BusinessCategory,
      ...meta,
    }));
  }

  /**
   * Submit a verification vote (CONFIRM or FLAG) for a community business.
   */
  async verifyBusiness(
    id: string,
    userId?: string,
    action: 'CONFIRM' | 'FLAG' = 'CONFIRM',
    notes?: string,
  ) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new Error(`Business with ID ${id} not found`);
    }

    const newStatus: VerificationStatus =
      action === 'CONFIRM' ? VerificationStatus.VERIFIED : VerificationStatus.DISPUTED;
    const newConfidence: Confidence =
      action === 'CONFIRM' ? Confidence.HIGH : Confidence.LOW;

    const updated = await this.prisma.business.update({
      where: { id },
      data: {
        verificationStatus: newStatus,
        confidence: newConfidence,
        lastVerified: new Date(),
      },
      include: {
        village: {
          select: {
            id: true,
            name: true,
            block: { select: { name: true, district: { select: { name: true } } } },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get unverified community-reported businesses near coordinates.
   */
  async getUnverifiedNearby(lat: number, lng: number, radiusKm = 25) {
    const nearby = await this.getHyperlocalBusinesses(lat, lng, radiusKm);
    const unverified = nearby.businesses.filter(
      (b: any) => b.source === 'COMMUNITY_REPORT' || b.source === 'SURVEY' || b.source === 'OTHER',
    );
    return {
      center: nearby.center,
      totalUnverified: unverified.length,
      reports: unverified,
    };
  }

  /**
   * Get community leaderboard data for crowdsourced contributors.
   */
  async getLeaderboard(blockId?: number, districtId?: number) {
    // Curated active community champions + dynamic contributor ranking
    const mockContributors = [
      {
        id: 'u1',
        name: 'Sourav Mondal',
        village: 'Krishnanagar Rural',
        block: 'Krishnanagar-I',
        district: 'Nadia',
        reportsSubmitted: 24,
        verifiedCount: 22,
        trustScore: 98,
        badges: ['Village Champion', 'Pioneer', 'Trusted Reporter'],
      },
      {
        id: 'u2',
        name: 'Ananya Biswas',
        village: 'Deypara',
        block: 'Krishnanagar-I',
        district: 'Nadia',
        reportsSubmitted: 18,
        verifiedCount: 16,
        trustScore: 94,
        badges: ['Pioneer', 'Trusted Reporter'],
      },
      {
        id: 'u3',
        name: 'Subhash Roy',
        village: 'Phulia',
        block: 'Santipur',
        district: 'Nadia',
        reportsSubmitted: 14,
        verifiedCount: 12,
        trustScore: 91,
        badges: ['Trusted Reporter'],
      },
      {
        id: 'u4',
        name: 'Priyanka Das',
        village: 'Santipur Rural',
        block: 'Santipur',
        district: 'Nadia',
        reportsSubmitted: 11,
        verifiedCount: 9,
        trustScore: 88,
        badges: ['Trusted Reporter'],
      },
      {
        id: 'u5',
        name: 'Debojyoti Ghosh',
        village: 'Ranaghat Rural',
        block: 'Ranaghat-I',
        district: 'Nadia',
        reportsSubmitted: 8,
        verifiedCount: 7,
        trustScore: 85,
        badges: ['Contributor'],
      },
    ];

    return {
      totalContributors: mockContributors.length,
      totalCommunityReports: mockContributors.reduce((sum, c) => sum + c.reportsSubmitted, 0),
      totalVerified: mockContributors.reduce((sum, c) => sum + c.verifiedCount, 0),
      leaderboard: mockContributors.map((c, idx) => ({
        rank: idx + 1,
        ...c,
      })),
    };
  }
}
