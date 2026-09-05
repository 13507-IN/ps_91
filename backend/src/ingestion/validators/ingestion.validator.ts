// ============================================================
// Data Quality Validator
// Validates raw ingestion data before DB persistence
// ============================================================

export interface ValidationRule<T> {
  name: string;
  check: (record: T) => boolean;
  message: string;
}

/**
 * Common data quality validation rules for India geospatial & economic data.
 */
export const CommonRules = {
  /** Check if latitude falls within valid bounds for India (6.0 to 37.5) */
  isValidIndiaLatitude: (lat: number | null | undefined): boolean => {
    if (lat === null || lat === undefined || isNaN(lat)) return true; // null is handled by required field checks if needed
    return lat >= 6.0 && lat <= 37.5;
  },

  /** Check if longitude falls within valid bounds for India (68.0 to 97.5) */
  isValidIndiaLongitude: (lng: number | null | undefined): boolean => {
    if (lng === null || lng === undefined || isNaN(lng)) return true;
    return lng >= 68.0 && lng <= 97.5;
  },

  /** Non-negative integer rule */
  isNonNegativeInt: (val: number | null | undefined): boolean => {
    if (val === null || val === undefined) return true;
    return Number.isInteger(val) && val >= 0;
  },

  /** Non-negative float rule */
  isNonNegativeFloat: (val: number | null | undefined): boolean => {
    if (val === null || val === undefined || isNaN(val)) return true;
    return val >= 0;
  },

  /** LGD Code validation (must be positive integer) */
  isValidLgdCode: (code: number | null | undefined): boolean => {
    if (code === null || code === undefined) return false;
    return Number.isInteger(code) && code > 0;
  },
};

/**
 * Generic validator runner against a record using defined rules.
 */
export function validateRecord<T>(record: T, rules: ValidationRule<T>[]): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    try {
      if (!rule.check(record)) {
        errors.push(`[${rule.name}] ${rule.message}`);
      }
    } catch (err) {
      errors.push(`[${rule.name}] Validation check threw error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return errors;
}

/**
 * Computes a quality confidence score (HIGH, MEDIUM, LOW) based on record completeness.
 */
export function computeConfidenceScore(fields: (unknown | null | undefined)[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  const total = fields.length;
  if (total === 0) return 'LOW';

  const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  const ratio = filled / total;

  if (ratio >= 0.85) return 'HIGH';
  if (ratio >= 0.5) return 'MEDIUM';
  return 'LOW';
}
