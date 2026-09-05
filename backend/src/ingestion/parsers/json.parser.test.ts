import { describe, it, expect } from 'vitest';
import { parseJsonString } from './json.parser.js';

describe('JSON Parser', () => {
  it('parses valid JSON array string', () => {
    const jsonContent = JSON.stringify([
      { id: 1, name: 'Item A' },
      { id: 2, name: 'Item B' },
    ]);

    const records = parseJsonString(
      jsonContent,
      (item) => ({
        id: Number(item.id),
        name: String(item.name),
      }),
      (record) => (record.id <= 0 ? ['ID must be positive'] : []),
    );

    expect(records).toHaveLength(2);
    expect(records[0]?.isValid).toBe(true);
    expect(records[0]?.data).toEqual({ id: 1, name: 'Item A' });
  });

  it('extracts array from specified data key', () => {
    const jsonContent = JSON.stringify({
      status: 'ok',
      records: [{ code: 'X' }, { code: 'Y' }],
    });

    const records = parseJsonString(
      jsonContent,
      (item) => ({ code: String(item.code) }),
      undefined,
      'records',
    );

    expect(records).toHaveLength(2);
    expect(records[1]?.data).toEqual({ code: 'Y' });
  });
});
