import type { PrismaClient } from '@prisma/client';
import { BusinessCategory } from '@prisma/client';

export interface MonthSeasonalData {
  monthIndex: number; // 1-12
  monthName: string;
  season: 'KHARIF' | 'RABI' | 'ZAID' | 'FESTIVE_PEAK' | 'LEAN';
  favorability: 'HIGH' | 'MODERATE' | 'LOW';
  favorabilityScore: number; // 0-100
  demandIndex: number; // 0.5 - 2.0 (1.0 is baseline)
  priceIndex: number; // 0.7 - 1.5
  events: string[];
  recommendedActivities: string[];
}

export interface SeasonalCalendarOutput {
  category: BusinessCategory;
  district: string;
  bestMonthsToLaunch: string[];
  peakDemandMonths: string[];
  leanMonths: string[];
  months: MonthSeasonalData[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export class SeasonalService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates a 12-month seasonal business calendar based on agricultural cycles,
   * Mandi price trends, and regional festivals.
   */
  async getSeasonalCalendar(
    category: BusinessCategory,
    district = 'Nadia',
  ): Promise<SeasonalCalendarOutput> {
    // Determine category-specific seasonal patterns
    const months: MonthSeasonalData[] = MONTH_NAMES.map((name, idx) => {
      const monthNum = idx + 1;
      let favorability: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
      let favorabilityScore = 65;
      let demandIndex = 1.0;
      let priceIndex = 1.0;
      let season: MonthSeasonalData['season'] = 'RABI';
      const events: string[] = [];
      const recommendedActivities: string[] = [];

      // Festive markers in Bengal / Eastern India
      if (monthNum === 1) events.push('Poush Sankranti & Winter Harvest');
      if (monthNum === 4) events.push('Poila Boishakh (Bengali New Year)');
      if (monthNum === 8) events.push('Monsoon Sowing (Aman Paddy)');
      if (monthNum === 10 || monthNum === 11) events.push('Durga Puja, Diwali & Kali Puja Festivities');

      // Category-specific variations
      switch (category) {
        case BusinessCategory.DAIRY:
          if (monthNum >= 10 || monthNum <= 2) {
            // Winter: high milk yield & sweet demand
            favorability = 'HIGH';
            favorabilityScore = 90;
            demandIndex = 1.35;
            priceIndex = 1.1;
            recommendedActivities.push('Peak milk sweets production', 'Cold storage distribution');
          } else if (monthNum >= 5 && monthNum <= 7) {
            // Summer: lean milk production, heat stress
            favorability = 'LOW';
            favorabilityScore = 45;
            demandIndex = 0.85;
            priceIndex = 1.25;
            recommendedActivities.push('Cattle cooling management', 'Focus on paneer and curd');
          } else {
            favorabilityScore = 70;
            recommendedActivities.push('Steady local distribution', 'Fodder stockpiling');
          }
          break;

        case BusinessCategory.TEXTILES_TAILORING:
          if (monthNum >= 8 && monthNum <= 10) {
            // Puja shopping spike
            favorability = 'HIGH';
            favorabilityScore = 95;
            demandIndex = 1.8;
            priceIndex = 1.2;
            season = 'FESTIVE_PEAK';
            events.push('Peak festive apparel demand');
            recommendedActivities.push('Overtime stitching', 'Bulk fabric procurement');
          } else if (monthNum === 4) {
            favorability = 'HIGH';
            favorabilityScore = 85;
            demandIndex = 1.4;
            events.push('New Year & Wedding Season');
            recommendedActivities.push('Traditional Taant saree sales');
          } else if (monthNum >= 6 && monthNum <= 7) {
            favorability = 'LOW';
            favorabilityScore = 40;
            demandIndex = 0.7;
            season = 'LEAN';
            recommendedActivities.push('Inventory restocking', 'Sample design preparation');
          }
          break;

        case BusinessCategory.FOOD_PROCESSING:
          if (monthNum >= 11 || monthNum <= 2) {
            favorability = 'HIGH';
            favorabilityScore = 92;
            demandIndex = 1.45;
            priceIndex = 0.9; // Raw paddy/mustard available cheaper post-harvest
            season = 'RABI';
            events.push('Kharif Harvest Arrival');
            recommendedActivities.push('Procure raw paddy at wholesale rates', 'Run milling plants at full capacity');
          } else {
            favorability = 'MODERATE';
            favorabilityScore = 65;
            demandIndex = 1.0;
            recommendedActivities.push('Value-added packaging', 'Local retail supply');
          }
          break;

        case BusinessCategory.POULTRY:
          if (monthNum >= 10 || monthNum <= 2) {
            favorability = 'HIGH';
            favorabilityScore = 88;
            demandIndex = 1.3;
            priceIndex = 1.15;
            recommendedActivities.push('Increase broiler batch size', 'Egg marketing');
          } else if (monthNum >= 5 && monthNum <= 6) {
            favorability = 'LOW';
            favorabilityScore = 50;
            demandIndex = 0.8;
            recommendedActivities.push('Ventilation control', 'Heat stress prevention');
          }
          break;

        default:
          if (monthNum >= 10 && monthNum <= 11) {
            favorability = 'HIGH';
            favorabilityScore = 85;
            demandIndex = 1.3;
            season = 'FESTIVE_PEAK';
          } else {
            favorabilityScore = 65;
          }
          recommendedActivities.push('Standard operations and sales');
      }

      return {
        monthIndex: monthNum,
        monthName: name,
        season,
        favorability,
        favorabilityScore,
        demandIndex,
        priceIndex,
        events,
        recommendedActivities,
      };
    });

    const peakDemandMonths = months
      .filter((m) => m.demandIndex >= 1.25)
      .map((m) => m.monthName);

    const leanMonths = months
      .filter((m) => m.demandIndex < 0.9)
      .map((m) => m.monthName);

    const bestMonthsToLaunch = months
      .filter((m) => m.favorability === 'HIGH')
      .slice(0, 3)
      .map((m) => m.monthName);

    return {
      category,
      district,
      bestMonthsToLaunch: bestMonthsToLaunch.length > 0 ? bestMonthsToLaunch : ['October', 'November', 'January'],
      peakDemandMonths,
      leanMonths,
      months,
    };
  }
}
