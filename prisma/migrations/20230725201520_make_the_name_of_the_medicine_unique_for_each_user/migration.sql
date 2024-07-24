/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Medicines` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Medicines_name_userId_key" ON "Medicines"("name", "userId");
