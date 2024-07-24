import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactsController],
  providers: [ContactsService, CloudinaryService],
})
export class ContactsModule {}
