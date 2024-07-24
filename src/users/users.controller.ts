import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { UseValidation, getCurrentUser } from '@/common/decorators';
import { USERS_BASE_URL } from '@/constants';
import { UsersService } from './users.service';
import { ImageSize } from '@/common/decorators/imageUpload.decorator';
import { updateUserSchema } from './validation-schemas';

@Controller(USERS_BASE_URL)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Patch('update')
  @UseValidation(updateUserSchema)
  @ImageSize({ sizeInMb: 2 })
  async updateUserInfo(@getCurrentUser('id') currentUserId, @Body() data) {
    return await this.userService.updateUserInfo(currentUserId, data);
  }

  @Post('generate-qr')
  @HttpCode(HttpStatus.OK)
  async generateQrCode(@getCurrentUser() user) {
    return await this.userService.generateHashedQrCode(user);
  }
}
