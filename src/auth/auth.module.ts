import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RtStrategy, AtStrategy } from './strategies';
import { PrismaModule } from '@/database/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MailingModule } from '@/mailing/mailing.module';
@Module({
  imports: [UsersModule, PrismaModule, JwtModule.register({}), MailingModule],
  providers: [AuthService, AtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
