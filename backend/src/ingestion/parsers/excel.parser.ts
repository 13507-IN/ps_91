import { readFile, stat } from 'node:fs/promises';
import * as XLSX from 'xlsx';
import type { ParsedRecord } from '../types.js';

// ============================================================
// Excel Parser (.xlsx, .xls)
// ============================================================

export interface ExcelParseOptions {
  /** Sheet name or index (0-indexed) to read. Defaults to first sheet. */
  sheet?: string | number;
  /** Whether the first row contains headers. Default: true */
  headers?: boolean;
}

/**
 * Parse an Excel file into typed records.
 *
 * @param filePath - Absolute path to the Excel file
 * @param transformer - Function to transform a raw row object into the target type
 * @param validator - Optional validation function
 * @param options - Options including sheet selection
 */
export async function parseExcelFile<T>(
  filePath: string,
  transformer: (row: Record<string, unknown>, index: number) => T,
  validator?: (record: T, index: number) => string[],
  options?: ExcelParseOptions,
): Promise<ParsedRecord<T>[]> {
  await stat(filePath);

  const fileBuffer = await readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  let sheetName: string;

  if (typeof options?.sheet === 'string') {
    sheetName = options.sheet;
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Sheet "${sheetName}" not found in workbook. Available: ${workbook.SheetNames.join(', ')}`);
    }
  } else if (typeof options?.sheet === 'number') {
    const name = workbook.SheetNames[options.sheet];
    if (!name) {
      throw new Error(`Sheet index ${options.sheet} out of bounds (total sheets: ${workbook.SheetNames.length})`);
    }
    sheetName = name;
  } else {
    sheetName = workbook.SheetNames[0] ?? '';
    if (!sheetName) {
      throw new Error('Workbook contains no sheets');
    }
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" could not be read`);
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: false,
    defval: '',
  });

  return rawRows.map((row, index) => {
    const rowIndex = index + 1;
    try {
      const data = transformer(row, rowIndex);
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
