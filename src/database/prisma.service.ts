import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService, private readonly logger: Logger) {
    const url = config.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  async onModuleInit() {
    this.$connect()
      .then(() => {
        this.logger.debug('Database is connected');
      })
      .then(() => {
        this.seed();
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('Database is disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    // teardown logic
    return Promise.all([this.user.deleteMany()]).then(() => {
      this.logger.warn('All users all deleted');
    });
  }

  async seed() {
    // await this.user.deleteMany();
  }
}
