import { Module } from '@nestjs/common';
import { DiseaseController } from './disease.controller';
import { DiseaseService } from './disease.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiseaseController],
  providers: [DiseaseService],
})
export class DiseaseModule {}
