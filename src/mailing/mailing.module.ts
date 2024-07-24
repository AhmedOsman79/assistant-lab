import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MailingService, ConfigService],
  exports: [MailingService],
})
export class MailingModule {}
