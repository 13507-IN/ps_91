import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { ParsedRecord } from '../types.js';

// ============================================================
// Streaming CSV Parser
// ============================================================

export interface CsvParseOptions {
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Whether the first row is headers (default: true) */
  headers?: boolean;
  /** Skip empty lines (default: true) */
  skipEmpty?: boolean;
  /** Trim whitespace from values (default: true) */
  trim?: boolean;
  /** Encoding (default: 'utf-8') */
  encoding?: BufferEncoding;
}

/**
 * Parse a CSV file into typed records using streaming.
 * Handles large files efficiently without loading everything into memory.
 *
 * @param filePath - Absolute path to the CSV file
 * @param transformer - Function to transform a raw row object into the target type
 * @param validator - Optional function to validate the transformed record
 * @param options - CSV parsing options
 */
export async function parseCsvFile<T>(
  filePath: string,
  transformer: (row: Record<string, string>, index: number) => T,
  validator?: (record: T, index: number) => string[],
  options?: CsvParseOptions,
): Promise<ParsedRecord<T>[]> {
  // Check file exists
  await stat(filePath);

  const records: ParsedRecord<T>[] = [];
  let rowIndex = 0;

  return new Promise<ParsedRecord<T>[]>((resolve, reject) => {
    const stream = createReadStream(filePath, {
      encoding: options?.encoding ?? 'utf-8',
    });

    const parser = parse({
      delimiter: options?.delimiter ?? ',',
      columns: options?.headers !== false,
      skip_empty_lines: options?.skipEmpty !== false,
      trim: options?.trim !== false,
      relax_column_count: true,
      skip_records_with_error: true,
    });

    stream.pipe(parser);

    parser.on('data', (row: Record<string, string>) => {
      rowIndex++;
      try {
        const data = transformer(row, rowIndex);
        const errors = validator ? validator(data, rowIndex) : [];

        records.push({
          data,
          rowIndex,
          isValid: errors.length === 0,
          errors,
        });
      } catch (err) {
        records.push({
          data: {} as T,
          rowIndex,
          isValid: false,
          errors: [`Transform error at row ${rowIndex}: ${err instanceof Error ? err.message : String(err)}`],
        });
      }
    });

    parser.on('error', (err) => {
      reject(new Error(`CSV parse error: ${err.message}`));
    });

    parser.on('end', () => {
      resolve(records);
    });
  });
}

/**
 * Parse CSV content from a string (useful for tests and small data).
 */
export async function parseCsvString<T>(
  content: string,
  transformer: (row: Record<string, string>, index: number) => T,
  validator?: (record: T, index: number) => string[],
  options?: CsvParseOptions,
): Promise<ParsedRecord<T>[]> {
  const records: ParsedRecord<T>[] = [];
  let rowIndex = 0;

  return new Promise<ParsedRecord<T>[]>((resolve, reject) => {
    const parser = parse({
      delimiter: options?.delimiter ?? ',',
      columns: options?.headers !== false,
      skip_empty_lines: options?.skipEmpty !== false,
      trim: options?.trim !== false,
      relax_column_count: true,
    });

    parser.on('data', (row: Record<string, string>) => {
      rowIndex++;
      try {
        const data = transformer(row, rowIndex);
        const errors = validator ? validator(data, rowIndex) : [];
        records.push({ data, rowIndex, isValid: errors.length === 0, errors });
      } catch (err) {
        records.push({
          data: {} as T,
          rowIndex,
          isValid: false,
          errors: [`Transform error at row ${rowIndex}: ${err instanceof Error ? err.message : String(err)}`],
        });
      }
    });

    parser.on('error', (err) => reject(new Error(`CSV parse error: ${err.message}`)));
    parser.on('end', () => resolve(records));

    parser.write(content);
    parser.end();
  });
}
