-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL,
ADD COLUMN IF NOT EXISTS "googleId" TEXT,
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "whatsappOptIn" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");
