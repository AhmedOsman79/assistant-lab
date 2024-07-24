import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UseValidation, getCurrentUser } from '@/common/decorators';
import { DiseaseService } from './disease.service';
import { createDiseaseSchema, updateDiseaseSchema } from './validation-schemas';
import { DISEASES_BASE_URL } from '@/constants';

@Controller(DISEASES_BASE_URL)
export class DiseaseController {
  constructor(private readonly diseaseService: DiseaseService) {}

  @Get()
  async getMyDisesaes(@getCurrentUser('id') currentUserId) {
    return await this.diseaseService.getDiseasesOfUser(currentUserId);
  }

  @Post()
  @UseValidation(createDiseaseSchema)
  async createDisease(@Body() data, @getCurrentUser('id') currentUserId) {
    return await this.diseaseService.create(currentUserId, data);
  }

  @Put('/:id')
  @UseValidation(updateDiseaseSchema)
  async updateDisease(
    @getCurrentUser('id') currentUserId,
    @Body() data,
    @Param('id') diseaseId,
  ) {
    return await this.diseaseService.update(currentUserId, diseaseId, data);
  }

  @Delete('/:id')
  async deleteDisease(
    @Param('id') diseaseId,
    @getCurrentUser('id') currentUserId,
  ) {
    return await this.diseaseService.delete(currentUserId, diseaseId);
  }
}
