-- Indexes for slow-query elimination
-- (schema.prisma @@index entries — names match Prisma's generated conventions)

-- CreateIndex
CREATE INDEX "Village_latitude_longitude_idx" ON "Village"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Business_latitude_longitude_idx" ON "Business"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Business_registrationId_idx" ON "Business"("registrationId");

-- CreateIndex
CREATE INDEX "CommodityPrice_commodity_market_date_idx" ON "CommodityPrice"("commodity", "market", "date");

-- Raw DDL: trigram GIN indexes + geom columns/backfill (idempotent)
-- NOTE: pg_trgm powers ILIKE '%...%' lookups used by contains / mode: insensitive.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_commodity_price_commodity_trgm" ON "CommodityPrice" USING GIN ("commodity" gin_trgm_ops);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_commodity_price_district_trgm" ON "CommodityPrice" USING GIN ("district" gin_trgm_ops);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_village_name_local_trgm" ON "Village" USING GIN ("nameLocal" gin_trgm_ops);

-- Ensure PostGIS geometry columns + GIST indexes exist (self-contained, safe on fresh DBs)
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE "Village" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_village_geom ON "Village" USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_business_geom ON "Business" USING GIST(geom);

-- Backfill geometry columns so the GIST spatial indexes cover rows created
-- before the geom column / triggers existed.
UPDATE "Village"
SET geom = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)
WHERE geom IS NULL AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

UPDATE "Business"
SET geom = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)
WHERE geom IS NULL AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL;