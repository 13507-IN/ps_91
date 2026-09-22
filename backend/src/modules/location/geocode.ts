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

export interface ReverseGeocodeResult {
  villageName: string;
  blockName?: string;
  districtName?: string;
  stateName?: string;
  displayName?: string;
}

/**
 * Reverse geocode latitude and longitude into an Indian village/town location using OpenStreetMap Nominatim.
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    if (!data || !data.address) return null;
    const addr = data.address;
    const villageName =
      addr.village ||
      addr.hamlet ||
      addr.town ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.city_district ||
      addr.municipality ||
      addr.city ||
      addr.county ||
      'Local Village';
    const blockName = addr.subdistrict || addr.county || '';
    const districtName = addr.state_district || addr.district || addr.county || '';
    const stateName = addr.state || 'West Bengal';

    return {
      villageName,
      blockName,
      districtName,
      stateName,
      displayName: data.display_name,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Default geocoder bound to a Fastify instance so tests can swap it out.
 * Exposed via app decorators if needed; kept simple for now.
 */
export function createGeocoder(_fastify: FastifyInstance): Geocoder {
  return geocodePlace;
}