-- AlterTable
ALTER TABLE "Medicines" ADD COLUMN     "dosageSchedule" JSONB NOT NULL DEFAULT '[]';
