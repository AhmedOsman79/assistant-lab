import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  providers: [CloudinaryService],
  imports: [PrismaModule],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
