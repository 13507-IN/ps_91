import { describe, it, expect } from 'vitest';
import { CommonRules, validateRecord, computeConfidenceScore } from './ingestion.validator.js';

describe('Data Quality Validator', () => {
  it('validates India latitude and longitude bounds correctly', () => {
    expect(CommonRules.isValidIndiaLatitude(23.4013)).toBe(true);
    expect(CommonRules.isValidIndiaLatitude(-5.0)).toBe(false);

    expect(CommonRules.isValidIndiaLongitude(88.501)).toBe(true);
    expect(CommonRules.isValidIndiaLongitude(150.0)).toBe(false);
  });

  it('runs validation rules against record', () => {
    const record = { lat: 50.0, pop: -10 };
    const errors = validateRecord(record, [
      {
        name: 'IndiaLat',
        check: (r) => CommonRules.isValidIndiaLatitude(r.lat),
        message: 'Latitude out of India bounds',
      },
      {
        name: 'PopNonNeg',
        check: (r) => CommonRules.isNonNegativeInt(r.pop),
        message: 'Population must be non-negative',
      },
    ]);

    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('Latitude out of India bounds');
    expect(errors[1]).toContain('Population must be non-negative');
  });

  it('computes confidence score based on completeness ratio', () => {
    expect(computeConfidenceScore(['a', 'b', 'c', 'd'])).toBe('HIGH');
    expect(computeConfidenceScore(['a', 'b', null, undefined])).toBe('MEDIUM');
    expect(computeConfidenceScore(['a', null, null, undefined])).toBe('LOW');
  });
});
