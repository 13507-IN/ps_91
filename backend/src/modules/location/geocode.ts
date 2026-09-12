import type { FastifyInstance } from 'fastify';

export interface GeocodeParts {
  village?: string;
  block?: string;
  district?: string;
  state?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

const BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'ArthSetu/1.0';

const join = (...parts: Array<string | undefined>): string =>
  parts.filter((p) => p && p.trim()).join(', ');

/**
 * Geocode an Indian place using OpenStreetMap Nominatim.
 * Tries progressively broader queries: village+block+district+state → village+district+state
 * → village+state → block+district+state → district+state → village.
 */
export async function geocodePlace(parts: GeocodeParts): Promise<GeocodeResult | null> {
  const { village, block, district, state } = parts;

  const queries = [
    join(village, block, district, state),
    join(village, district, state),
    join(village, state),
    join(block, district, state),
    join(district, state),
    village?.trim(),
  ].filter((q): q is string => Boolean(q));

  for (const q of queries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const url =
        `${BASE_URL}?q=${encodeURIComponent(q)}` +
        '&format=json&limit=1&countrycodes=in&addressdetails=0';
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{
        lat?: string;
        lon?: string;
      }>;
      const first = data[0];
      if (first && first.lat && first.lon) {
        return {
          latitude: parseFloat(first.lat),
          longitude: parseFloat(first.lon),
        };
      }
    } catch {
      // Network/abort errors — try the next (broader) query.
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export type Geocoder = (parts: GeocodeParts) => Promise<GeocodeResult | null>;

/**
 * Default geocoder bound to a Fastify instance so tests can swap it out.
 * Exposed via app decorators if needed; kept simple for now.
 */
export function createGeocoder(_fastify: FastifyInstance): Geocoder {
  return geocodePlace;
}