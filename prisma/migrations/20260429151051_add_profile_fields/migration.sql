-- AlterTable
ALTER TABLE "User" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "awards" JSONB,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "major" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "university" TEXT;
