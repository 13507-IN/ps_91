import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../lib/errors.js';

export interface VillageSummary {
  id: number;
  name: string;
  nameLocal: string | null;
  blockName: string;
  districtName: string;
  stateName: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm?: number;
  totalPopulation?: number | null;
  totalHouseholds?: number | null;
}

export class LocationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Fuzzy / text search villages by name.
   */
  async searchVillages(query: string, limit = 20): Promise<VillageSummary[]> {
    const villages = await this.prisma.village.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameLocal: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        block: {
          include: {
            district: {
              include: {
                state: true,
              },
            },
          },
        },
        censusData: {
          select: {
            totalPopulation: true,
            totalHouseholds: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return villages.map((v) => ({
      id: v.id,
      name: v.name,
      nameLocal: v.nameLocal,
      blockName: v.block.name,
      districtName: v.block.district.name,
      stateName: v.block.district.state.name,
      latitude: v.latitude,
      longitude: v.longitude,
      totalPopulation: v.censusData?.totalPopulation ?? null,
      totalHouseholds: v.censusData?.totalHouseholds ?? null,
    }));
  }

  /**
   * Get full details of a village including demographics, amenities, agriculture, and infrastructure.
   */
  async getVillageById(id: number) {
    const village = await this.prisma.village.findUnique({
      where: { id },
      include: {
        block: {
          include: {
            district: {
              include: {
                state: true,
              },
            },
          },
        },
        censusData: true,
        amenities: true,
        livestock: true,
        crops: true,
        roads: true,
        businesses: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!village) {
      throw new NotFoundError(`Village with ID ${id} not found`);
    }

    return village;
  }

  /**
   * Find villages within a radius (km) of given coordinates using PostGIS with Haversine fallback.
   */
  async getNearbyVillages(
    lat: number,
    lng: number,
    radiusKm = 10,
    limit = 50,
  ): Promise<VillageSummary[]> {
    try {
      // PostGIS ST_DWithin query (using meters)
      const radiusMeters = radiusKm * 1000;
      const rawResults = await this.prisma.$queryRaw<
        Array<{
          id: number;
          name: string;
          nameLocal: string | null;
          blockName: string;
          districtName: string;
          stateName: string;
          latitude: number | null;
          longitude: number | null;
          distanceKm: number;
          totalPopulation: number | null;
          totalHouseholds: number | null;
        }>
      >`
        SELECT 
          v.id,
          v.name,
          v."nameLocal",
          b.name AS "blockName",
          d.name AS "districtName",
          s.name AS "stateName",
          v.latitude,
          v.longitude,
          ROUND((ST_Distance(v.geom, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) / 1000.0)::numeric, 2)::float AS "distanceKm",
          c."totalPopulation",
          c."totalHouseholds"
        FROM "Village" v
        JOIN "Block" b ON v."blockId" = b.id
        JOIN "District" d ON b."districtId" = d.id
        JOIN "State" s ON d."stateId" = s.id
        LEFT JOIN "CensusData" c ON v.id = c."villageId"
        WHERE v.geom IS NOT NULL
          AND ST_DWithin(v.geom::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
        ORDER BY "distanceKm" ASC
        LIMIT ${limit};
      `;

      return rawResults;
    } catch {
      // Fallback: Haversine bounding-box search via Prisma when PostGIS geom column is not populated
      const latDelta = radiusKm / 111.0;
      const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

      const candidates = await this.prisma.village.findMany({
        where: {
          latitude: {
            gte: lat - latDelta,
            lte: lat + latDelta,
          },
          longitude: {
            gte: lng - lngDelta,
            lte: lng + lngDelta,
          },
        },
        include: {
          block: {
            include: {
              district: {
                include: {
                  state: true,
                },
              },
            },
          },
          censusData: {
            select: {
              totalPopulation: true,
              totalHouseholds: true,
            },
          },
        },
      });

      const withDistance: VillageSummary[] = [];
      for (const v of candidates) {
        if (v.latitude === null || v.longitude === null) continue;
        const dist = this.haversineDistance(lat, lng, v.latitude, v.longitude);
        if (dist <= radiusKm) {
          withDistance.push({
            id: v.id,
            name: v.name,
            nameLocal: v.nameLocal,
            blockName: v.block.name,
            districtName: v.block.district.name,
            stateName: v.block.district.state.name,
            latitude: v.latitude,
            longitude: v.longitude,
            distanceKm: Math.round(dist * 100) / 100,
            totalPopulation: v.censusData?.totalPopulation ?? null,
            totalHouseholds: v.censusData?.totalHouseholds ?? null,
          });
        }
      }

      withDistance.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      return withDistance.slice(0, limit);
    }
  }

  /**
   * Standard Haversine distance in kilometers between two lat/lng pairs.
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
