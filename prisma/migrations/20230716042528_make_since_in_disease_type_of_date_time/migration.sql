/*
  Warnings:

  - The `since` column on the `Disease` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Disease" DROP COLUMN "since",
ADD COLUMN     "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
