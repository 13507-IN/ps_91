// ============================================================
// Application-wide constants
// ============================================================

/** Default catchment radius for market analysis (km) */
export const DEFAULT_CATCHMENT_RADIUS_KM = 10;

/** Maximum catchment radius allowed (km) */
export const MAX_CATCHMENT_RADIUS_KM = 50;

/** Minimum catchment radius allowed (km) */
export const MIN_CATCHMENT_RADIUS_KM = 1;

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum pagination page size */
export const MAX_PAGE_SIZE = 100;

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Redis cache TTLs (in seconds) */
export const CACHE_TTL = {
  /** Market intelligence / demographic data: 24 hours */
  MARKET_INTELLIGENCE: 86400,
  /** Competitor analysis: 6 hours */
  COMPETITOR_ANALYSIS: 21600,
  /** Commodity prices: 1 hour */
  COMMODITY_PRICES: 3600,
  /** Scheme matching results: 12 hours */
  SCHEME_MATCHING: 43200,
  /** Village details: 24 hours */
  VILLAGE_DETAILS: 86400,
} as const;

/** Business categories supported in MVP */
export const MVP_BUSINESS_CATEGORIES = [
  'DAIRY',
  'FOOD_PROCESSING',
  'RETAIL',
  'TEXTILES_TAILORING',
  'POULTRY',
] as const;

/** Feasibility score interpretation thresholds */
export const FEASIBILITY_THRESHOLDS = {
  HIGHLY_PROMISING: 80,
  VIABLE: 65,
  NEEDS_OPTIMIZATION: 50,
} as const;

/** Confidence levels */
export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;

/** API version prefix */
export const API_PREFIX = '/api';
