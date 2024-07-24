import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  createNestAppInstance,
  createUser,
  isArabic,
  sampleBase64Image,
} from '@test/helpers';
import { ARTICLES_BASE_URL } from '@/constants';
import { createArticleDTO } from '@/interfaces';
import { PrismaService } from '@/database/prisma.service';

const sampleArticle: createArticleDTO = {
  image: sampleBase64Image,
  data: [
    {
      langCode: 'en',
      content: 'mock content',
      title: 'mock title',
    },
    {
      langCode: 'ar',
      content: 'السلام عليكم',
      title: 'السلام عليكم',
    },
  ],
};

describe('articles controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    //
  });

  beforeAll(async () => {
    app = await createNestAppInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe(`POST ${ARTICLES_BASE_URL}`, () => {
    it('should not create article -- no admin', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      const mockUser = await createUser(app, {});
      const TOKEN = await mockUser.getToken();

      const response = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(sampleArticle);

      await mockUser.delete();

      const engVersion = await prisma.articleTranslations.findFirst({
        where: { title: sampleArticle.data[0].title },
      });
      expect(response.statusCode).toBe(403);
      expect(engVersion).toBeNull();
    });

    it('should create article -- admin user', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      const mockUser = await createUser(app, { isAdmin: true });
      const TOKEN = await mockUser.getToken();

      const response = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send({ ...sampleArticle });

      const engVersion = await prisma.articleTranslations.findFirst({
        where: { title: sampleArticle.data[0].title },
      });
      // delete the article
      await prisma.articles.delete({
        where: { id: engVersion.articleId },
      });

      await mockUser.delete();

      expect(response.statusCode).toBe(201);
      expect(engVersion).toBeTruthy();
    });
  });

  describe(`GET ${ARTICLES_BASE_URL}`, () => {
    it('should get the list of articles', async () => {
      const mockUser = await createUser(app, {});
      const TOKEN = await mockUser.getToken();

      await request(app.getHttpServer())
        .get('/api/v1/articles')
        .set('Authorization', `Bearer ${TOKEN}`)
        .expect(200);

      await mockUser.delete();
    });

    it('should get the list of articles with arabic translation', async () => {
      const prisma = app.get<PrismaService>(PrismaService);
      const mockUser = await createUser(app, { isAdmin: true });
      const TOKEN = await mockUser.getToken();

      // create article
      const createArticleRes = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send(sampleArticle);

      const response = await request(app.getHttpServer())
        .get('/api/v1/articles?lang=ar')
        .set('Authorization', `Bearer ${TOKEN}`)
        .expect(200);

      const articles = response.body.data;


      expect(articles).toBeInstanceOf(Array);
      expect(articles.some(article => isArabic(article.title))).toBe(true)
      // cleanup
      await prisma.articles.delete({
        where: { id: createArticleRes.body.data.id },
      });
      await mockUser.delete();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
