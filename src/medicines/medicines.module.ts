import { Module } from '@nestjs/common';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedicinesController],
  providers: [MedicinesService, CloudinaryService],
})
export class MedicinesModule {}
