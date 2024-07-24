import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LangQuery, UseValidation, getCurrentUser } from '@/common/decorators';
import { ArticlesService } from './articles.service';
import { ARTICLES_BASE_URL } from '@/constants';
import {
  createArticleSchema,
  makeArticleHotSchema,
} from './validation-schemas';

@Controller(ARTICLES_BASE_URL)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseValidation(createArticleSchema)
  async createArticle(@getCurrentUser('id') userId, @Body() data) {
    return this.articlesService.createArticle(userId, data);
  }

  @Get()
  async getArticles(@Query() options) {
    return this.articlesService.getArticles(options);
  }

  @Get('/hot')
  async getHotArticle(@LangQuery() lang) {
    return this.articlesService.getHotArticle(lang);
  }

  @Get('/:id')
  async getArticleById(@Param('id') articleId, @LangQuery() lang) {
    return this.articlesService.getArticleById(articleId, lang);
  }

  @Patch('/hot')
  @UseValidation(makeArticleHotSchema)
  async makeArticleHot(@getCurrentUser('id') userId, @Body() data) {
    return this.articlesService.makeArticleHot(userId, data.articleId);
  }
}
