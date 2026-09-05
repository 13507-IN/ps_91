import type { PrismaClient } from '@prisma/client';
import {
  BusinessCategory,
  VerificationStatus,
  Confidence,
  DataSource,
  OperatingStatus,
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
   * List all supported business categories with domain metadata and typical capital requirements.
   */
  getCategories(): CategoryInfo[] {
    return Object.entries(BUSINESS_CATEGORIES_METADATA).map(([code, meta]) => ({
      code: code as BusinessCategory,
      ...meta,
    }));
  }
}
