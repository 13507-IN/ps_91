import type { PrismaClient, Village, Block, District, State } from '@prisma/client';
import { NotFoundError } from '../../lib/errors.js';
import { geocodePlace, type Geocoder } from './geocode.js';
import type { CreateVillageInput } from './location.schema.js';

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
  constructor(
    private prisma: PrismaClient,
    private geocoder: Geocoder = geocodePlace,
  ) {}

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

    return villages.map((v) => this.toVillageSummary(v));
  }

  /**
   * Map a village (with nested block -> district -> state + censusData) to a summary shape.
   */
  private toVillageSummary(
    v: Village & {
      block: Block & { district: District & { state: State } };
      censusData?: { totalPopulation: number | null; totalHouseholds: number | null } | null;
    },
  ): VillageSummary {
    return {
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
    };
  }

  // IDs for user-created geography rows are generated well above the LGD code
  // ranges (states < 100, districts < 10k, blocks < 100k, villages < 10M) so
  // they can never collide with future official ingestion.
  private async nextStateId(): Promise<number> {
    const agg = await this.prisma.state.aggregate({ _max: { id: true } });
    return Math.max(100_000, (agg._max.id ?? 0) + 1);
  }

  private async nextDistrictId(): Promise<number> {
    const agg = await this.prisma.district.aggregate({ _max: { id: true } });
    return Math.max(1_000_000, (agg._max.id ?? 0) + 1);
  }

  private async nextBlockId(): Promise<number> {
    const agg = await this.prisma.block.aggregate({ _max: { id: true } });
    return Math.max(10_000_000, (agg._max.id ?? 0) + 1);
  }

  private async nextVillageId(): Promise<number> {
    const agg = await this.prisma.village.aggregate({ _max: { id: true } });
    return Math.max(100_000_000, (agg._max.id ?? 0) + 1);
  }

  /**
   * Create (or reuse) a village in the DB with coordinates.
   * Resolves/creates the State -> District -> Block hierarchy by name, geocodes
   * via Nominatim when no coordinates are supplied, and backfills missing
   * coordinates on an existing village.
   */
  async createVillage(input: CreateVillageInput): Promise<VillageSummary> {
    const stateName = input.state?.trim() || input.district?.trim() || input.block?.trim() || 'Unknown';
    const districtName = input.district?.trim() || input.block?.trim() || stateName;
    const blockName = input.block?.trim() || districtName;

    let state = await this.prisma.state.findFirst({
      where: { name: { equals: stateName, mode: 'insensitive' } },
    });
    if (!state) {
      state = await this.prisma.state.create({ data: { id: await this.nextStateId(), name: stateName } });
    }

    let district = await this.prisma.district.findFirst({
      where: { name: { equals: districtName, mode: 'insensitive' }, stateId: state.id },
    });
    if (!district) {
      district = await this.prisma.district.create({
        data: { id: await this.nextDistrictId(), name: districtName, stateId: state.id },
      });
    }

    let block = await this.prisma.block.findFirst({
      where: { name: { equals: blockName, mode: 'insensitive' }, districtId: district.id },
    });
    if (!block) {
      block = await this.prisma.block.create({
        data: { id: await this.nextBlockId(), name: blockName, districtId: district.id },
      });
    }

    // Avoid duplicate villages inside the same block.
    let village = await this.prisma.village.findFirst({
      where: { name: { equals: input.name, mode: 'insensitive' }, blockId: block.id },
      include: {
        block: { include: { district: { include: { state: true } } } },
        censusData: { select: { totalPopulation: true, totalHouseholds: true } },
      },
    });

    let latitude = input.latitude;
    let longitude = input.longitude;
    if (latitude == null || longitude == null) {
      const coords = await this.geocoder({
        village: input.name,
        block: blockName,
        district: districtName,
        state: stateName,
      });
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    if (village) {
      if (latitude != null && longitude != null && (village.latitude == null || village.longitude == null)) {
        village = await this.prisma.village.update({
          where: { id: village.id },
          data: { latitude, longitude },
          include: {
            block: { include: { district: { include: { state: true } } } },
            censusData: { select: { totalPopulation: true, totalHouseholds: true } },
          },
        });
        await this.setGeom(village.id, longitude, latitude);
      }
      return this.toVillageSummary(village);
    }

    village = await this.prisma.village.create({
      data: {
        id: await this.nextVillageId(),
        name: input.name,
        blockId: block.id,
        latitude,
        longitude,
      },
      include: {
        block: { include: { district: { include: { state: true } } } },
        censusData: { select: { totalPopulation: true, totalHouseholds: true } },
      },
    });

    if (latitude != null && longitude != null) {
      await this.setGeom(village.id, longitude, latitude);
    }

    return this.toVillageSummary(village);
  }

  /**
   * Best-effort write of the PostGIS geometry column. Ignored when PostGIS is unavailable.
   */
  private async setGeom(villageId: number, lng: number, lat: number): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE "Village"
        SET geom = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        WHERE id = ${villageId}
      `;
    } catch {
      // PostGIS extension not available — coordinates still stored on the row.
    }
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
      const latDelta = radiusKm / 111.0;
      const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

      // Pure SQL Haversine query using latitude/longitude columns (works on ALL Postgres DBs without requiring PostGIS 'geom' column)
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
          ROUND((6371.0 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(${lat})) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(v.latitude))
            ))
          ))::numeric, 2)::float AS "distanceKm",
          c."totalPopulation",
          c."totalHouseholds"
        FROM "Village" v
        JOIN "Block" b ON v."blockId" = b.id
        JOIN "District" d ON b."districtId" = d.id
        JOIN "State" s ON d."stateId" = s.id
        LEFT JOIN "CensusData" c ON v.id = c."villageId"
        WHERE v.latitude IS NOT NULL 
          AND v.longitude IS NOT NULL
          AND v.latitude BETWEEN (${lat - latDelta}) AND (${lat + latDelta})
          AND v.longitude BETWEEN (${lng - lngDelta}) AND (${lng + lngDelta})
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
