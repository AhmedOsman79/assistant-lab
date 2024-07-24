-- CreateEnum
CREATE TYPE "MedicineType" AS ENUM ('tablets', 'capsules', 'liquids', 'injection', 'drops', 'effervescent', 'inhalers', 'suppositories', 'topical', 'vaginal_douches');

-- CreateEnum
CREATE TYPE "MedicineSubType" AS ENUM ('normal_tablets', 'lozenges_tablets', 'sublingual_tablets', 'syrups', 'suspension', 'gargle', 'oral_ampoules', 'IM', 'IV', 'SC', 'ID', 'eye_drops', 'oral_drops', 'ear_drops', 'nasal_drops', 'nasal_spray', 'rectal', 'vaginal', 'creams', 'ointments', 'lotions', 'local_sprays', 'dermal_patches');

-- CreateTable
CREATE TABLE "Medicines" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "type" "MedicineType" NOT NULL,
    "subType" "MedicineSubType",
    "dosage" DOUBLE PRECISION NOT NULL,
    "dosagePerDay" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "gapInDays" SMALLINT NOT NULL,

    CONSTRAINT "Medicines_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
