-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('normal', 'emergency', 'hot_line');

-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL,
    "image" TEXT,
    "email" TEXT,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
