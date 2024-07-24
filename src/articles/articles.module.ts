import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  controllers: [ArticlesController],
  imports: [PrismaModule],
  providers: [
    ArticlesService,
    CloudinaryService,
    UsersService,
    // user service dependencies
    JwtService,
  ],
})
export class ArticlesModule {}
