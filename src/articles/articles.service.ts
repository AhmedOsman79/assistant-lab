import { Injectable } from '@nestjs/common';
import { Articles, Prisma } from '@prisma/client';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { ErrorResponse } from '@/common/response';
import { DEFAULT_LOCALE, Locale, PERMISSION_ERROR } from '@/constants';
import { modelNames } from '@/constants/models';
import { PrismaService } from '@/database/prisma.service';
import { UsersService } from '@/users/users.service';
import { BaseService } from '@/common/base';
import { createArticleDTO } from '@/interfaces';

@Injectable()
export class ArticlesService extends BaseService<
  Articles,
  Prisma.ArticlesSelect,
  Prisma.ArticlesInclude
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly userService: UsersService,
  ) {
    super(prisma, modelNames.Articles);
  }

  private DEFAULT_ABSTRACT_LEN = 150;
  private async isUserAdmin(userId: string) {
    const isAdmin = (await this.userService.findById(userId)).isAdmin;
    if (!isAdmin)
      throw new ErrorResponse({
        statusCode: 403,
        code: PERMISSION_ERROR,
      });
  }

  private ARTICLE_SELECT: (code: Locale) => Prisma.ArticlesSelect = (
    langCode: Locale,
  ) => ({
    id: true,
    image: true,
    isHot: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        image: true,
        email: true,
      },
    },
    articleTranslations: {
      where: {
        langCode,
      },
      select: {
        title: true,
        content: true,
      },
    },
  });

  private getAbstract(articleContent: string, N: number): string {
    // Check if the articleContent length is greater than N
    if (articleContent.length <= N) {
      return articleContent;
    }

    // Get the substring of the first N characters
    const abstract = articleContent.substring(0, N);

    // Trim the abstract to remove any incomplete words at the end
    const lastSpaceIndex = abstract.lastIndexOf(' ');
    return abstract.substring(0, lastSpaceIndex) + '...';
  }

  private mapArticleToArticlePreview(
    article,
    abstractLen = this.DEFAULT_ABSTRACT_LEN,
  ) {
    const title = article.articleTranslations[0].title;
    // const abstract = this.getAbstract(
    //   article.articleTranslations[0].content,
    //   abstractLen,
    // );
    const content = article.articleTranslations[0].content;
    delete article.articleTranslations;
    return {
      ...article,
      title,
      content,
    };
  }

  async getArticles(options) {
    const {
      cursor,
      perPage,
      lang = DEFAULT_LOCALE,
      abstractLen = this.DEFAULT_ABSTRACT_LEN,
    } = options;

    let cursorCriteria = undefined;
    if (cursor)
      cursorCriteria = {
        id: cursor,
      };

    const articles = await this.prisma.articles.findMany({
      take: perPage ? parseInt(perPage) : undefined,
      skip: cursor ? 1 : undefined,
      cursor: cursorCriteria,
      select: this.ARTICLE_SELECT(lang),
    });

    return articles.map((article) => {
      return this.mapArticleToArticlePreview(article, abstractLen);
    });
  }

  async getArticleById(articleId: string, lang: Locale = DEFAULT_LOCALE) {
    const article = await this.findById(articleId, this.ARTICLE_SELECT(lang));

    article['title'] = article.articleTranslations[0].title;
    article['content'] = article.articleTranslations[0].content;
    delete article.articleTranslations;
    return article;
  }
  async createArticle(userId: string, body: createArticleDTO) {
    const { image, data } = body;
    await this.isUserAdmin(userId);

    // create the article if the user is admin

    // create article template
    const article = await this.prisma.articles.create({
      data: {
        authorId: userId,
      },
    });

    // TODO: think of not using await in order to not block the code while the image is being uploaded
    const imgSrc = (
      await this.cloudinary.updateImageNoValidation(
        article.id,
        modelNames.Articles,
        image,
      )
    )[1];
    article.image = imgSrc;

    // create translations
    const translations = data.map((translation) => ({
      ...translation,
      articleId: article.id,
    }));

    await this.prisma.articleTranslations.createMany({
      data: translations,
    });

    return article;
  }

  private removeHotArticleNoValidation() {
    return this.prisma.articles.updateMany({
      where: {
        isHot: true,
      },
      data: {
        isHot: false,
      },
    });
  }

  private setArticleAsHotNoValidation(articleId: string) {
    return this.prisma.articles.update({
      where: {
        id: articleId,
      },
      data: {
        isHot: true,
      },
    });
  }
  async makeArticleHot(userId: string, articleId: string) {
    await this.isUserAdmin(userId);
    await this.getArticleById(articleId);

    await this.prisma.$transaction([
      this.removeHotArticleNoValidation(),
      this.setArticleAsHotNoValidation(articleId),
    ]);
    return true;
  }

  async getHotArticle(lang) {
    const hotArticle = await this.prisma.articles.findFirst({
      where: { isHot: true },
      select: this.ARTICLE_SELECT(lang),
    });

    if (!hotArticle) return false;

    return this.mapArticleToArticlePreview(hotArticle);
  }
}
