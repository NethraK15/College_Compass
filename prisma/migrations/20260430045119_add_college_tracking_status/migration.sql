-- CreateEnum
CREATE TYPE "CollegeTrackingStatus" AS ENUM ('LONG_LIST', 'SHORT_LIST', 'WANT_TO_APPLY', 'APPLIED');

-- AlterTable
ALTER TABLE "SavedCollege" ADD COLUMN     "status" "CollegeTrackingStatus" NOT NULL DEFAULT 'LONG_LIST';
