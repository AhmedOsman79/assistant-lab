-- DropForeignKey
ALTER TABLE "ArticleTranslations" DROP CONSTRAINT "ArticleTranslations_articleId_fkey";

-- AddForeignKey
ALTER TABLE "ArticleTranslations" ADD CONSTRAINT "ArticleTranslations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
