import { UserLoginDto } from './dto/user-login.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AtGuard } from './../common/guards';
import { getCurrentUser, UseValidation, Public } from '@/common/decorators';
import {
  loginSchema,
  signupSchema,
  verifyAccountSchema,
} from './validation-schemas';
import { AUTH_BASE_URL } from '@/constants';
import { SuccessResponse } from '@/common/response';
import { Throttle } from '@nestjs/throttler';

@Controller(AUTH_BASE_URL)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  @Throttle(5, 60) // 5 requests per 1 minute for each ip address in login for brute-force attacks
  @UseValidation(loginSchema)
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: UserLoginDto) {
    const tokens = await this.authService.login(body);
    return tokens;
  }

  @Post('/signup')
  @Public()
  @UseValidation(signupSchema)
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body) {
    const user = await this.authService.signup(body);

    return new SuccessResponse({
      data: user,
      statusCode: HttpStatus.CREATED,
    });
  }

  @Post('/verify')
  @Public()
  @UseValidation(verifyAccountSchema)
  async verifyUserAccount(@Body() body) {
    return await this.authService.verifyAccount(body);
  }

  @Get('me')
  async me(@getCurrentUser('id') userId) {
    return this.authService.me(userId);
  }

  @Post('logout')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@getCurrentUser('id') id: string) {
    const success = await this.authService.logout(id);
    return success;
  }
}
