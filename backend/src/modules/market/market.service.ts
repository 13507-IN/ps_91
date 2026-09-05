import type { PrismaClient, BusinessCategory } from '@prisma/client';
import { LocationService } from '../location/location.service.js';
import { cacheGet, cacheSet, cacheKey } from '../../lib/cache.js';
import { NotFoundError } from '../../lib/errors.js';

export interface CatchmentDemographics {
  totalVillages: number;
  totalPopulation: number;
  totalHouseholds: number;
  malePopulation: number;
  femalePopulation: number;
  scPopulation: number;
  stPopulation: number;
  avgLiteracyRate: number;
  totalWorkers: number;
  mainWorkers: number;
  marginalWorkers: number;
  agriculturalLabourers: number;
  cultivators: number;
  householdIndustryWorkers: number;
  otherWorkers: number;
}

export interface CatchmentAmenities {
  villagesWithPrimarySchool: number;
  villagesWithMiddleSchool: number;
  villagesWithHighSchool: number;
  villagesWithPHC: number;
  villagesWithBankBranch: number;
  villagesWithATM: number;
  villagesWithElectricity: number;
  villagesWithBusService: number;
  villagesWithRailway: number;
  villagesWithMobileNetwork: number;
  villagesWithInternet: number;
}

export interface MarketIntelligenceResult {
  catchment: {
    center: { lat: number; lng: number };
    radiusKm: number;
    areaSqKm: number;
  };
  demographics: CatchmentDemographics;
  amenities: CatchmentAmenities;
  topCrops: Array<{ cropName: string; totalAreaHectares: number; totalProductionTonnes: number }>;
  livestock: Array<{ animalType: string; totalCount: number; milkProducingCount: number }>;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  cachedAt?: string;
}

export interface CompetitorItem {
  id: string;
  name: string | null;
  category: BusinessCategory;
  subcategory: string | null;
  scale: string | null;
  operatingStatus: string;
  source: string;
  verificationStatus: string;
}

export interface CompetitorAnalysisResult {
  catchment: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
  categoryFilter?: BusinessCategory;
  totalObserved: number;
  totalReported: number;
  estimatedInferredMin: number;
  estimatedInferredMax: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  densityPerSqKm: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: {
    observed: CompetitorItem[];
    reported: CompetitorItem[];
  };
}

export class MarketService {
  private locationService: LocationService;

  constructor(private prisma: PrismaClient) {
    this.locationService = new LocationService(prisma);
  }

  /**
   * Aggregate demographic, amenity, and agricultural intelligence across a geographical catchment.
   */
  async getMarketIntelligence(
    lat: number,
    lng: number,
    radiusKm = 10,
    businessCategory?: BusinessCategory,
  ): Promise<MarketIntelligenceResult> {
    const key = cacheKey('intel', lat.toFixed(3), lng.toFixed(3), radiusKm, businessCategory ?? 'ALL');
    const cached = await cacheGet<MarketIntelligenceResult>(key);
    if (cached) {
      return { ...cached, cachedAt: 'from_redis' };
    }

    // 1. Get all villages in the catchment radius
    const nearbyVillages = await this.locationService.getNearbyVillages(lat, lng, radiusKm, 300);
    const villageIds = nearbyVillages.map((v) => v.id);

    if (villageIds.length === 0) {
      const areaSqKm = Math.round(Math.PI * radiusKm * radiusKm * 100) / 100;
      return {
        catchment: { center: { lat, lng }, radiusKm, areaSqKm },
        demographics: {
          totalVillages: 0,
          totalPopulation: 0,
          totalHouseholds: 0,
          malePopulation: 0,
          femalePopulation: 0,
          scPopulation: 0,
          stPopulation: 0,
          avgLiteracyRate: 0,
          totalWorkers: 0,
          mainWorkers: 0,
          marginalWorkers: 0,
          agriculturalLabourers: 0,
          cultivators: 0,
          householdIndustryWorkers: 0,
          otherWorkers: 0,
        },
        amenities: {
          villagesWithPrimarySchool: 0,
          villagesWithMiddleSchool: 0,
          villagesWithHighSchool: 0,
          villagesWithPHC: 0,
          villagesWithBankBranch: 0,
          villagesWithATM: 0,
          villagesWithElectricity: 0,
          villagesWithBusService: 0,
          villagesWithRailway: 0,
          villagesWithMobileNetwork: 0,
          villagesWithInternet: 0,
        },
        topCrops: [],
        livestock: [],
        confidence: 'LOW',
        source: 'Census of India + Government GIS',
      };
    }

    // 2. Fetch Census demographic data for all villages in parallel
    const [censusRecords, amenityRecords, cropRecords, livestockRecords] = await Promise.all([
      this.prisma.censusData.findMany({
        where: { villageId: { in: villageIds } },
      }),
      this.prisma.villageAmenity.findMany({
        where: { villageId: { in: villageIds } },
      }),
      this.prisma.cropData.findMany({
        where: { villageId: { in: villageIds } },
      }),
      this.prisma.livestockData.findMany({
        where: { villageId: { in: villageIds } },
      }),
    ]);

    // Aggregate demographics
    let totalPop = 0;
    let totalHH = 0;
    let malePop = 0;
    let femalePop = 0;
    let scPop = 0;
    let stPop = 0;
    let literacySum = 0;
    let literacyCount = 0;
    let totalWorkers = 0;
    let mainWorkers = 0;
    let marginalWorkers = 0;
    let agLabourers = 0;
    let cultivators = 0;
    let householdWorkers = 0;
    let otherWorkers = 0;

    for (const c of censusRecords) {
      totalPop += c.totalPopulation ?? 0;
      totalHH += c.totalHouseholds ?? 0;
      malePop += c.malePopulation ?? 0;
      femalePop += c.femalePopulation ?? 0;
      scPop += c.scPopulation ?? 0;
      stPop += c.stPopulation ?? 0;
      if (c.literacyRate !== null && c.literacyRate !== undefined) {
        literacySum += c.literacyRate;
        literacyCount++;
      }
      totalWorkers += c.workingPopulation ?? 0;
      mainWorkers += c.mainWorkers ?? 0;
      marginalWorkers += c.marginalWorkers ?? 0;
      agLabourers += c.agriculturalLabourers ?? 0;
      cultivators += c.cultivators ?? 0;
      householdWorkers += c.householdWorkers ?? 0;
      otherWorkers += c.otherWorkers ?? 0;
    }

    const demographics: CatchmentDemographics = {
      totalVillages: villageIds.length,
      totalPopulation: totalPop,
      totalHouseholds: totalHH,
      malePopulation: malePop,
      femalePopulation: femalePop,
      scPopulation: scPop,
      stPopulation: stPop,
      avgLiteracyRate: literacyCount > 0 ? Math.round((literacySum / literacyCount) * 100) / 100 : 0,
      totalWorkers,
      mainWorkers,
      marginalWorkers,
      agriculturalLabourers: agLabourers,
      cultivators,
      householdIndustryWorkers: householdWorkers,
      otherWorkers,
    };

    // Aggregate amenities
    const amenities: CatchmentAmenities = {
      villagesWithPrimarySchool: amenityRecords.filter((a) => a.hasPrimarySchool).length,
      villagesWithMiddleSchool: amenityRecords.filter((a) => a.hasMiddleSchool).length,
      villagesWithHighSchool: amenityRecords.filter((a) => a.hasHighSchool).length,
      villagesWithPHC: amenityRecords.filter((a) => a.hasPHC).length,
      villagesWithBankBranch: amenityRecords.filter((a) => a.hasBankBranch).length,
      villagesWithATM: amenityRecords.filter((a) => a.hasATM).length,
      villagesWithElectricity: amenityRecords.filter((a) => a.hasElectricity).length,
      villagesWithBusService: amenityRecords.filter((a) => a.hasBusService).length,
      villagesWithRailway: amenityRecords.filter((a) => a.hasRailway).length,
      villagesWithMobileNetwork: amenityRecords.filter((a) => a.hasMobileNetwork).length,
      villagesWithInternet: amenityRecords.filter((a) => a.hasInternet).length,
    };

    // Aggregate crops
    const cropMap = new Map<string, { totalArea: number; totalProd: number }>();
    for (const crop of cropRecords) {
      const existing = cropMap.get(crop.cropName) ?? { totalArea: 0, totalProd: 0 };
      existing.totalArea += crop.areaHectares ?? 0;
      existing.totalProd += crop.productionTonnes ?? 0;
      cropMap.set(crop.cropName, existing);
    }
    const topCrops = Array.from(cropMap.entries())
      .map(([cropName, data]) => ({
        cropName,
        totalAreaHectares: Math.round(data.totalArea * 100) / 100,
        totalProductionTonnes: Math.round(data.totalProd * 100) / 100,
      }))
      .sort((a, b) => b.totalProductionTonnes - a.totalProductionTonnes)
      .slice(0, 10);

    // Aggregate livestock
    const livestockMap = new Map<string, { totalCount: number; milkCount: number }>();
    for (const ls of livestockRecords) {
      const existing = livestockMap.get(ls.animalType) ?? { totalCount: 0, milkCount: 0 };
      existing.totalCount += ls.count ?? 0;
      existing.milkCount += ls.milkProducing ?? 0;
      livestockMap.set(ls.animalType, existing);
    }
    const livestock = Array.from(livestockMap.entries())
      .map(([animalType, data]) => ({
        animalType,
        totalCount: data.totalCount,
        milkProducingCount: data.milkCount,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    const confidence =
      censusRecords.length >= villageIds.length * 0.7
        ? 'HIGH'
        : censusRecords.length >= villageIds.length * 0.3
          ? 'MEDIUM'
          : 'LOW';

    const areaSqKm = Math.round(Math.PI * radiusKm * radiusKm * 100) / 100;

    const result: MarketIntelligenceResult = {
      catchment: {
        center: { lat, lng },
        radiusKm,
        areaSqKm,
      },
      demographics,
      amenities,
      topCrops,
      livestock,
      confidence,
      source: 'Census of India 2011 + LGD + State Department Records',
    };

    // Cache in Redis for 24 hours (86,400 seconds)
    await cacheSet(key, result, 86400);

    return result;
  }

  /**
   * Retrieve observed, reported, and inferred competitors in the catchment.
   */
  async getCompetitorAnalysis(
    lat: number,
    lng: number,
    radiusKm = 10,
    category?: BusinessCategory,
  ): Promise<CompetitorAnalysisResult> {
    const key = cacheKey('comp', lat.toFixed(3), lng.toFixed(3), radiusKm, category ?? 'ALL');
    const cached = await cacheGet<CompetitorAnalysisResult>(key);
    if (cached) return cached;

    const nearbyVillages = await this.locationService.getNearbyVillages(lat, lng, radiusKm, 300);
    const villageIds = nearbyVillages.map((v) => v.id);

    const whereClause: {
      villageId?: { in: number[] };
      category?: BusinessCategory;
    } = {
      villageId: { in: villageIds },
    };

    if (category) {
      whereClause.category = category;
    }

    const businesses = await this.prisma.business.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        category: true,
        subcategory: true,
        scale: true,
        operatingStatus: true,
        source: true,
        verificationStatus: true,
      },
    });

    const observed = businesses.filter(
      (b) => b.verificationStatus === 'VERIFIED' || b.source === 'UDYAM' || b.source === 'GOVERNMENT',
    );
    const reported = businesses.filter(
      (b) => b.source === 'COMMUNITY_REPORT' || b.source === 'SURVEY',
    );

    // Heuristic inference of informal competitors based on population:
    // In rural India:
    // Dairy: ~1 micro dairy/milk seller per 250 households
    // Retail: ~1 kirana store per 150 households
    // Textiles: ~1 tailor per 350 households
    // Food processing: ~1 small flour/oil mill per 500 households
    // Poultry: ~1 small poultry unit per 800 households
    const totalHH = nearbyVillages.reduce((sum, v) => sum + (v.totalHouseholds ?? 0), 0);

    let benchmarkRatio = 300; // default 1 per 300 HH
    if (category === 'DAIRY') benchmarkRatio = 250;
    else if (category === 'RETAIL') benchmarkRatio = 150;
    else if (category === 'TEXTILES_TAILORING') benchmarkRatio = 350;
    else if (category === 'FOOD_PROCESSING') benchmarkRatio = 500;
    else if (category === 'POULTRY') benchmarkRatio = 800;

    const baselineEstimated = totalHH > 0 ? Math.round(totalHH / benchmarkRatio) : 5;
    const estimatedInferredMin = Math.max(1, Math.round(baselineEstimated * 0.7));
    const estimatedInferredMax = Math.max(3, Math.round(baselineEstimated * 1.3));

    const totalObserved = observed.length;
    const totalReported = reported.length;
    const totalEstimatedMin = totalObserved + totalReported + estimatedInferredMin;
    const totalEstimatedMax = totalObserved + totalReported + estimatedInferredMax;

    const areaSqKm = Math.PI * radiusKm * radiusKm;
    const avgEstimated = (totalEstimatedMin + totalEstimatedMax) / 2;
    const densityPerSqKm = Math.round((avgEstimated / (areaSqKm || 1)) * 100) / 100;

    const confidence =
      totalObserved > 10 ? 'HIGH' : totalObserved + totalReported > 3 ? 'MEDIUM' : 'LOW';

    const result: CompetitorAnalysisResult = {
      catchment: { lat, lng, radiusKm },
      categoryFilter: category,
      totalObserved,
      totalReported,
      estimatedInferredMin,
      estimatedInferredMax,
      totalEstimatedMin,
      totalEstimatedMax,
      densityPerSqKm,
      confidence,
      breakdown: {
        observed,
        reported,
      },
    };

    // Cache in Redis for 6 hours (21,600 seconds)
    await cacheSet(key, result, 21600);

    return result;
  }

  /**
   * Get latest commodity market prices from AGMARKNET.
   */
  async getCommodityPrices(commodity: string, district = 'Nadia') {
    const key = cacheKey('prices', commodity.toLowerCase(), district.toLowerCase());
    const cached = await cacheGet<Record<string, unknown>>(key);
    if (cached) return cached;

    const prices = await this.prisma.commodityPrice.findMany({
      where: {
        commodity: { contains: commodity, mode: 'insensitive' },
        district: { contains: district, mode: 'insensitive' },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    if (prices.length === 0) {
      // Return benchmark or fallback
      const fallback = {
        commodity,
        district,
        hasLiveMarketData: false,
        latestPrice: null,
        modalPrice: null,
        minPrice: null,
        maxPrice: null,
        unit: 'Quintal',
        recentRecords: [],
        confidence: 'LOW',
        notes: `No recent mandi transaction recorded for ${commodity} in ${district}.`,
      };
      return fallback;
    }

    const latest = prices[0];
    const result = {
      commodity: latest?.commodity ?? commodity,
      district: latest?.district ?? district,
      hasLiveMarketData: true,
      latestPrice: latest?.modalPrice ?? latest?.minPrice ?? null,
      modalPrice: latest?.modalPrice ?? null,
      minPrice: latest?.minPrice ?? null,
      maxPrice: latest?.maxPrice ?? null,
      unit: latest?.unit ?? 'Quintal',
      asOfDate: latest?.date.toISOString(),
      recentRecords: prices,
      confidence: 'HIGH',
      source: 'AGMARKNET Mandi Records',
    };

    // Cache in Redis for 1 hour (3,600 seconds)
    await cacheSet(key, result, 3600);

    return result;
  }

  /**
   * Get village amenities and road connectivity infrastructure.
   */
  async getInfrastructure(villageId: number) {
    const village = await this.prisma.village.findUnique({
      where: { id: villageId },
      include: {
        amenities: true,
        roads: true,
        block: {
          include: {
            district: {
              include: {
                state: true,
              },
            },
          },
        },
      },
    });

    if (!village) {
      throw new NotFoundError(`Village with ID ${villageId} not found`);
    }

    return {
      villageId: village.id,
      villageName: village.name,
      block: village.block.name,
      district: village.block.district.name,
      state: village.block.district.state.name,
      amenities: village.amenities,
      roads: village.roads,
    };
  }

  getCompetitors = this.getCompetitorAnalysis;
}
