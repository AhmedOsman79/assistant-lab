import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { ResponseInterceptor } from '@/common/interceptors';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@prisma/client';
import { AuthService } from '@/auth/auth.service';
import { Logger } from 'nestjs-pino';

export const sampleBase64Image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/wuABgAJFQJ6ZAAAAABJRU5ErkJggg==';

export const isArabic = (str: string): boolean => {
  const arabic = /[\u0600-\u06FF]/;
  return arabic.test(str);
};
type CreateMockUserOptions = {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  isAdmin?: boolean;
};
export type MockUser = Partial<User> & {
  getToken: () => Promise<string>;
  delete: () => void;
};
export async function createNestAppInstance(): Promise<INestApplication> {
  let app: INestApplication = null;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    providers: [],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Logger)));
  await app.init();

  return app;
}

export const createUser = async (
  nestApp: INestApplication,
  options: CreateMockUserOptions,
): Promise<MockUser> => {
  const prisma = nestApp.get<PrismaService>(PrismaService);
  const authService = nestApp.get<AuthService>(AuthService);

  const newUser = await prisma.user.create({
    data: {
      email: options.email || 'myCare@test.com',
      name: options.name || 'my_care_user',
      password: options.password || '123456',
      phone: options.phone || '+20578736857',
      verified: true,
      isAdmin: !!options.isAdmin,
    },
  });

  return {
    ...newUser,
    async delete() {
      await prisma.user.delete({ where: { id: newUser.id } });
    },
    async getToken() {
      const accessToken = (await authService.generateJWT(newUser)).accessToken;
      return accessToken;
    },
  };
};
