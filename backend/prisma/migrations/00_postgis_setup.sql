-- ============================================================
-- PostGIS Setup Migration
-- Run AFTER initial Prisma migration
-- ============================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add geometry columns to Village
ALTER TABLE "Village" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Add geometry columns to Business
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Create GIST spatial indexes
CREATE INDEX IF NOT EXISTS idx_village_geom ON "Village" USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_business_geom ON "Business" USING GIST(geom);

-- Create trigram index for fuzzy village name search
CREATE INDEX IF NOT EXISTS idx_village_name_trgm ON "Village" USING GIN(name gin_trgm_ops);

-- Function to auto-populate geom from lat/lng
CREATE OR REPLACE FUNCTION update_village_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate geom on insert/update
DROP TRIGGER IF EXISTS trg_village_geom ON "Village";
CREATE TRIGGER trg_village_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON "Village"
  FOR EACH ROW
  EXECUTE FUNCTION update_village_geom();

-- Same for Business
CREATE OR REPLACE FUNCTION update_business_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_business_geom ON "Business";
CREATE TRIGGER trg_business_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON "Business"
  FOR EACH ROW
  EXECUTE FUNCTION update_business_geom();
