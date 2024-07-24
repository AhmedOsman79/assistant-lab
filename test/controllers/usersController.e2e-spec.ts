import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  MockUser,
  createNestAppInstance,
  createUser,
  sampleBase64Image,
} from '@test/helpers';
import { PrismaService } from '@/database/prisma.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

describe('users controller', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mockUser: MockUser;

  beforeEach(async () => {
    //
  });

  beforeAll(async () => {
    app = await createNestAppInstance();
    prisma = app.get<PrismaService>(PrismaService);
    mockUser = await createUser(app, {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('PATCH /api/v1/users/update', () => {
    it('should update user info (phone only)', async () => {
      const TOKEN = await mockUser.getToken();

      const newPhone = '+2000000000000000';

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/update')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send({ phone: newPhone });

      expect(response.statusCode).toBe(200);
      const updatedUser = await prisma.user.findFirst({
        where: { email: mockUser.email },
      });
      expect(updatedUser.phone).toEqual(newPhone);
    });
  });

  describe('PATCH /api/v1/users/update', () => {
    it('should update user info (image only)', async () => {
      const TOKEN = await mockUser.getToken();

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/update')
        .set('Authorization', `Bearer ${TOKEN}`)
        .send({ base64Image: sampleBase64Image });

   
      expect(response.statusCode).toBe(200);
      const updatedUser = await prisma.user.findFirst({
        where: { email: mockUser.email },
      });

      // clear the cloudinary storage
      await app
      .get<CloudinaryService>(CloudinaryService)
      .deleteImage(updatedUser.image);
  
         
      expect(updatedUser.image).toContain('res.cloudinary.com');
    }, 9000);

  });

  describe('POST /api/v1/users/generate-qr', () => {
    it('should generate qr code for the user', async () => {
      const TOKEN = await mockUser.getToken();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users/generate-qr')
        .set('Authorization', `Bearer ${TOKEN}`);

      expect(response.statusCode).toBe(200);
    });
  });

  afterAll(async () => {
    await mockUser.delete();
    await app.close();
  });
});
