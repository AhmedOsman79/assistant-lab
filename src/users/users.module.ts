import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  providers: [UsersService, CloudinaryService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
