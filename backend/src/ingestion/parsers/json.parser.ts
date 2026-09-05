import { readFile, stat } from 'node:fs/promises';
import type { ParsedRecord } from '../types.js';

// ============================================================
// JSON Parser
// ============================================================

/**
 * Parse a JSON file into typed records.
 * Supports both JSON arrays and JSON objects with a specified data key.
 *
 * @param filePath - Absolute path to the JSON file
 * @param transformer - Function to transform a raw object into the target type
 * @param validator - Optional validation function
 * @param dataKey - Optional key to extract array from (e.g., 'data', 'records')
 */
export async function parseJsonFile<T>(
  filePath: string,
  transformer: (item: Record<string, unknown>, index: number) => T,
  validator?: (record: T, index: number) => string[],
  dataKey?: string,
): Promise<ParsedRecord<T>[]> {
  await stat(filePath);

  const raw = await readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);

  let items: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    items = parsed as Record<string, unknown>[];
  } else if (dataKey && typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const extracted = obj[dataKey];
    if (!Array.isArray(extracted)) {
      throw new Error(`Expected array at key "${dataKey}" but got ${typeof extracted}`);
    }
    items = extracted as Record<string, unknown>[];
  } else {
    throw new Error('JSON must be an array or an object with a data key');
  }

  return items.map((item, index) => {
    const rowIndex = index + 1;
    try {
      const data = transformer(item, rowIndex);
      const errors = validator ? validator(data, rowIndex) : [];
      return { data, rowIndex, isValid: errors.length === 0, errors };
    } catch (err) {
      return {
        data: {} as T,
        rowIndex,
        isValid: false,
        errors: [`Transform error at row ${rowIndex}: ${err instanceof Error ? err.message : String(err)}`],
      };
    }
  });
}

/**
 * Parse a JSON string into typed records (useful for tests).
 */
export function parseJsonString<T>(
  content: string,
  transformer: (item: Record<string, unknown>, index: number) => T,
  validator?: (record: T, index: number) => string[],
  dataKey?: string,
): ParsedRecord<T>[] {
  const parsed: unknown = JSON.parse(content);

  let items: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    items = parsed as Record<string, unknown>[];
  } else if (dataKey && typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const extracted = obj[dataKey];
    if (!Array.isArray(extracted)) {
      throw new Error(`Expected array at key "${dataKey}" but got ${typeof extracted}`);
    }
    items = extracted as Record<string, unknown>[];
  } else {
    throw new Error('JSON must be an array or an object with a data key');
  }

  return items.map((item, index) => {
    const rowIndex = index + 1;
    try {
      const data = transformer(item, rowIndex);
      const errors = validator ? validator(data, rowIndex) : [];
      return { data, rowIndex, isValid: errors.length === 0, errors };
    } catch (err) {
      return {
        data: {} as T,
        rowIndex,
        isValid: false,
        errors: [`Transform error at row ${rowIndex}: ${err instanceof Error ? err.message : String(err)}`],
      };
    }
  });
}
