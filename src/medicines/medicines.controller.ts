import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  MEDICINES_BASE_URL,
} from '@/constants';
import { MedicinesService } from './medicines.service';
import { Public, UseValidation, getCurrentUser } from '@/common/decorators';
import {
  MedicinesSchema,
  createMedicineSchema,
  pasueAndResumeSchema,
  setTakenSchema,
} from './validation-schemas';
import { ImageSize } from '@/common/decorators/imageUpload.decorator';

@Controller(MEDICINES_BASE_URL)
export class MedicinesController {
  constructor(private readonly medicineService: MedicinesService) {}

  @Post()
  @UseValidation(createMedicineSchema)
  @ImageSize({ imageName: 'image', sizeInMb: 1.5 })
  async createMedicine(@getCurrentUser('id') userId, @Body() data) {
    return this.medicineService.create(userId, data);
  }

  @Post('set-taken')
  @UseValidation(setTakenSchema)
  async setMedicineTaken(
    @getCurrentUser('id') userId,
    @Body() data,
    @Query('timezone') timezone,
  ) {
    return this.medicineService.setMedicineTaken(userId, data, timezone);
  }

  @Get('all')
  async getUserMedicines(@getCurrentUser('id') userId, @Query('lang') lang) {
    return this.medicineService.getUserMedicines(userId, lang);
  }

  @Post('guest-medicines')
  @UseValidation(MedicinesSchema)
  @Public()
  async getGuestMedicines(
    @Query('lang') lang = DEFAULT_LOCALE,
    @Query('timezone') timezone = DEFAULT_TIMEZONE,
    @Body() data,
  ) {
    return this.medicineService.proccessMedicines(
      data.medicines,
      data.date,
      lang,
      timezone,
    );
  }

  @Get('/:id')
  async getMedicineById(
    @getCurrentUser('id') userId,
    @Query('lang') lang = DEFAULT_LOCALE,
    @Query('timezone') timezone = DEFAULT_TIMEZONE,
    @Param('id') medicineId,
  ) {
    return this.medicineService.getMedicineById(
      userId,
      medicineId,
      lang,
      timezone,
    );
  }

  @Get()
  async getMedicinesByDate(
    @getCurrentUser('id') userId,
    @Query('lang') lang = DEFAULT_LOCALE,
    @Query('date') date,
    @Query('timezone') timezone = DEFAULT_TIMEZONE,
  ) {
    return this.medicineService.getUserActiveMedicines(
      userId,
      date,
      lang,
      timezone,
    );
  }

  @Post('pause-medicine')
  @UseValidation(pasueAndResumeSchema)
  async pauseMedicne(
    @getCurrentUser('id') userId,
    @Body() data,
    @Query('timezone') timezone = DEFAULT_TIMEZONE,
  ) {
    return this.medicineService.pauseMedicine(userId, data, timezone);
  }

  @Post('resume-medicine')
  @UseValidation(pasueAndResumeSchema)
  async resumeMedicne(
    @getCurrentUser('id') userId,
    @Body() data,
    @Query('timezone') timezone = DEFAULT_TIMEZONE,
  ) {
    return this.medicineService.resumeMedicine(userId, data, timezone);
  }
}
