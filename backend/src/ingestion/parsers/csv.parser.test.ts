import { describe, it, expect } from 'vitest';
import { parseCsvString } from './csv.parser.js';

describe('CSV Parser', () => {
  it('parses valid CSV string into typed objects', async () => {
    const csvContent = `name,age,city\nAlice,30,Kolkata\nBob,25,Krishnanagar`;

    const records = await parseCsvString(
      csvContent,
      (row) => ({
        name: row.name ?? '',
        age: parseInt(row.age ?? '0', 10),
        city: row.city ?? '',
      }),
      (record) => {
        const errors: string[] = [];
        if (!record.name) errors.push('Name required');
        if (record.age <= 0) errors.push('Age must be positive');
        return errors;
      },
    );

    expect(records).toHaveLength(2);
    expect(records[0]?.isValid).toBe(true);
    expect(records[0]?.data).toEqual({ name: 'Alice', age: 30, city: 'Kolkata' });
    expect(records[1]?.data).toEqual({ name: 'Bob', age: 25, city: 'Krishnanagar' });
  });

  it('flags invalid rows according to validator', async () => {
    const csvContent = `name,age\nAlice,-5\n,20`;

    const records = await parseCsvString(
      csvContent,
      (row) => ({
        name: row.name ?? '',
        age: parseInt(row.age ?? '0', 10),
      }),
      (record) => {
        const errors: string[] = [];
        if (!record.name) errors.push('Name required');
        if (record.age <= 0) errors.push('Age must be positive');
        return errors;
      },
    );

    expect(records).toHaveLength(2);
    expect(records[0]?.isValid).toBe(false);
    expect(records[0]?.errors).toContain('Age must be positive');
    expect(records[1]?.isValid).toBe(false);
    expect(records[1]?.errors).toContain('Name required');
  });
});
