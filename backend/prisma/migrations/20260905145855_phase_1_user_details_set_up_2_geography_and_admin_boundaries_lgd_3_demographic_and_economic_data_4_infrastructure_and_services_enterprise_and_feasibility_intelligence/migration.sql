-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "SocialCategory" AS ENUM ('GENERAL', 'SC', 'ST', 'OBC', 'MINORITY');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('DAIRY', 'FOOD_PROCESSING', 'RETAIL', 'TEXTILES_TAILORING', 'POULTRY', 'AGRICULTURE', 'LIVESTOCK', 'TRANSPORT', 'HANDICRAFT', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "OperatingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SEASONAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BusinessScale" AS ENUM ('MICRO', 'SMALL', 'MEDIUM');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('CENSUS', 'UDYAM', 'LGD', 'COMMUNITY_REPORT', 'SURVEY', 'AI_INFERRED', 'AGMARKNET', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CropSeason" AS ENUM ('KHARIF', 'RABI', 'ZAID', 'WHOLE_YEAR');

-- CreateEnum
CREATE TYPE "RoadType" AS ENUM ('NATIONAL_HIGHWAY', 'STATE_HIGHWAY', 'DISTRICT_ROAD', 'PMGSY_ROAD', 'VILLAGE_ROAD', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "category" "SocialCategory",
    "isMinority" BOOLEAN NOT NULL DEFAULT false,
    "location" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "stateId" INTEGER NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "districtId" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "blockId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CensusData" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER NOT NULL,
    "totalPopulation" INTEGER,
    "malePopulation" INTEGER,
    "femalePopulation" INTEGER,
    "totalHouseholds" INTEGER,
    "scPopulation" INTEGER,
    "stPopulation" INTEGER,
    "literacyRate" DOUBLE PRECISION,
    "workingPopulation" INTEGER,
    "mainWorkers" INTEGER,
    "marginalWorkers" INTEGER,
    "nonWorkers" INTEGER,
    "cultivators" INTEGER,
    "agriculturalLabourers" INTEGER,
    "householdWorkers" INTEGER,
    "otherWorkers" INTEGER,
    "censusYear" INTEGER NOT NULL DEFAULT 2011,
    "source" TEXT NOT NULL DEFAULT 'Census of India',
    "confidence" "Confidence" NOT NULL DEFAULT 'HIGH',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CensusData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER,
    "name" TEXT,
    "category" "BusinessCategory" NOT NULL,
    "subcategory" TEXT,
    "products" TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "operatingStatus" "OperatingStatus" NOT NULL DEFAULT 'ACTIVE',
    "scale" "BusinessScale",
    "priceRange" "PriceRange",
    "seasonality" TEXT,
    "source" "DataSource" NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "lastVerified" TIMESTAMP(3),
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "registrationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivestockData" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER NOT NULL,
    "animalType" TEXT NOT NULL,
    "count" INTEGER,
    "milkProducing" INTEGER,
    "censusYear" INTEGER,
    "source" "DataSource" NOT NULL,
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivestockData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropData" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER,
    "districtName" TEXT,
    "cropName" TEXT NOT NULL,
    "season" "CropSeason" NOT NULL,
    "areaHectares" DOUBLE PRECISION,
    "productionTonnes" DOUBLE PRECISION,
    "yieldPerHectare" DOUBLE PRECISION,
    "year" INTEGER,
    "source" "DataSource" NOT NULL DEFAULT 'GOVERNMENT',
    "confidence" "Confidence" NOT NULL DEFAULT 'HIGH',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommodityPrice" (
    "id" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "variety" TEXT,
    "market" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "modalPrice" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT 'Quintal',
    "date" TIMESTAMP(3) NOT NULL,
    "source" "DataSource" NOT NULL DEFAULT 'AGMARKNET',
    "confidence" "Confidence" NOT NULL DEFAULT 'HIGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommodityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadConnectivity" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER NOT NULL,
    "roadType" "RoadType" NOT NULL,
    "surfaceType" TEXT,
    "nearestTown" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "source" "DataSource" NOT NULL DEFAULT 'GOVERNMENT',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadConnectivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VillageAmenity" (
    "id" TEXT NOT NULL,
    "villageId" INTEGER NOT NULL,
    "hasPrimarySchool" BOOLEAN,
    "hasMiddleSchool" BOOLEAN,
    "hasHighSchool" BOOLEAN,
    "hasPHC" BOOLEAN,
    "hasPostOffice" BOOLEAN,
    "hasBankBranch" BOOLEAN,
    "hasATM" BOOLEAN,
    "hasElectricity" BOOLEAN,
    "hasBusService" BOOLEAN,
    "hasRailway" BOOLEAN,
    "hasMobileNetwork" BOOLEAN,
    "hasInternet" BOOLEAN,
    "nearestTownKm" DOUBLE PRECISION,
    "source" "DataSource" NOT NULL DEFAULT 'CENSUS',
    "censusYear" INTEGER NOT NULL DEFAULT 2011,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VillageAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "villageId" INTEGER,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "catchmentRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "businessCategory" "BusinessCategory" NOT NULL,
    "businessIdea" TEXT,
    "availableCapital" DOUBLE PRECISION NOT NULL,
    "businessExperience" TEXT,
    "availableLand" TEXT,
    "availableEquipment" TEXT,
    "expectedWorkingHours" DOUBLE PRECISION,
    "marketIntelligence" JSONB,
    "competitorAnalysis" JSONB,
    "opportunityAnalysis" JSONB,
    "financialPlan" JSONB,
    "schemeMatch" JSONB,
    "riskAssessment" JSONB,
    "feasibilityScore" JSONB,
    "actionPlan" JSONB,
    "aiRecommendation" JSONB,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "District"("stateId");

-- CreateIndex
CREATE INDEX "Block_districtId_idx" ON "Block"("districtId");

-- CreateIndex
CREATE INDEX "Village_blockId_idx" ON "Village"("blockId");

-- CreateIndex
CREATE INDEX "Village_name_idx" ON "Village"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CensusData_villageId_key" ON "CensusData"("villageId");

-- CreateIndex
CREATE INDEX "Business_category_idx" ON "Business"("category");

-- CreateIndex
CREATE INDEX "Business_villageId_idx" ON "Business"("villageId");

-- CreateIndex
CREATE INDEX "LivestockData_villageId_idx" ON "LivestockData"("villageId");

-- CreateIndex
CREATE INDEX "LivestockData_animalType_idx" ON "LivestockData"("animalType");

-- CreateIndex
CREATE INDEX "CropData_villageId_idx" ON "CropData"("villageId");

-- CreateIndex
CREATE INDEX "CropData_cropName_idx" ON "CropData"("cropName");

-- CreateIndex
CREATE INDEX "CommodityPrice_commodity_district_date_idx" ON "CommodityPrice"("commodity", "district", "date" DESC);

-- CreateIndex
CREATE INDEX "RoadConnectivity_villageId_idx" ON "RoadConnectivity"("villageId");

-- CreateIndex
CREATE UNIQUE INDEX "VillageAmenity_villageId_key" ON "VillageAmenity"("villageId");

-- CreateIndex
CREATE INDEX "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CensusData" ADD CONSTRAINT "CensusData_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LivestockData" ADD CONSTRAINT "LivestockData_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropData" ADD CONSTRAINT "CropData_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadConnectivity" ADD CONSTRAINT "RoadConnectivity_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageAmenity" ADD CONSTRAINT "VillageAmenity_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
