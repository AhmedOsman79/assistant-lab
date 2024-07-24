/*
  Warnings:

  - A unique constraint covering the columns `[phone,userId]` on the table `Contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contacts_phone_userId_key" ON "Contacts"("phone", "userId");
