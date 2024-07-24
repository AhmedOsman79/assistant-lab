/*
  Warnings:

  - You are about to drop the column `availability` on the `Contacts` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contacts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contacts" DROP COLUMN "availability",
DROP COLUMN "email";

-- AlterTable
ALTER TABLE "Medicines" ALTER COLUMN "gapInDays" SET DEFAULT 0,
ALTER COLUMN "dosageSchedule" SET DEFAULT '{}';

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT,
    "availability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phone_userId_key" ON "Doctor"("phone", "userId");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
