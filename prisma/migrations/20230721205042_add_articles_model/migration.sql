-- CreateEnum
CREATE TYPE "Locales" AS ENUM ('ar', 'en');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Articales" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Articales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTranslations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "langCode" "Locales" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ArticleTranslations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Articales" ADD CONSTRAINT "Articales_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTranslations" ADD CONSTRAINT "ArticleTranslations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
