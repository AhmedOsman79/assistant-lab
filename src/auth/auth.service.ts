import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { UserLoginDto } from './dto/user-login.dto';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import {
  TOKEN_LIFETIME,
  RT_TOKEN_LIFETIME,
  INVALID_LOGIN,
  USER_NOT_VERIFIED,
  NO_VERIFICATION_WAS_SENT,
  INVALID_VERIFICATION_CODE,
  ACCOUNT_VERIFIED,
  RESOURCE_NOT_FOUND,
  ACCOUNR_ALREADY_VIRIFIED,
} from '@/constants';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorResponse, SuccessResponse } from '@/common/response';
import { MailingService } from '@/mailing/mailing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private config: ConfigService,
    private jwt: JwtService,
    private db: PrismaService,
    private readonly mailService: MailingService,
  ) {}

  async deletePreviousVerifiedCodes(userEmail: string) {
    return await this.db.verified_Codes.deleteMany({
      where: { email: userEmail },
    });
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async handleSendConfirmationEmail(email: string, name: string) {
    await this.deletePreviousVerifiedCodes(email);
    await this.mailService.sendConfirmationMail(email, name);
  }
  async signup(data) {
    const newUser = await this.userService.createUser(data);

    this.handleSendConfirmationEmail(newUser.email, newUser.name);

    return newUser;
  }

  async login(credentials: UserLoginDto) {
    const user = await this.validate(credentials);

    const tokens = await this.generateJWT(user);
    // await this.userService.updateRtHash(_user.id, tokens.refreshToken);
    return tokens;
  }

  // async refresh(userId: string, refreshToken: string) {
  //   const _user = await this.db.user.findFirst({ where: { id: userId } });

  //   if (!_user)
  //     throw new ForbiddenException('Access Denied');

  //   const matches = await argon2.verify(_user.hashedRt, refreshToken);

  //   if (!matches) throw new ForbiddenException('Access Denied');

  //   const tokens = await this.generateJWT(_user);
  //   await this.userService.updateRtHash(_user.id, tokens.refreshToken);

  //   return tokens;
  // }

  async logout(userId: string): Promise<boolean> {
    await this.db.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        //
      },
    });
    return true;
  }

  // utilities
  async validate(credentials: UserLoginDto) {
    const { email, password } = credentials;
    const user = await this.userService.findByEmail(email);

    if (!user)
      throw new ErrorResponse({
        statusCode: 401,
        code: INVALID_LOGIN,
      });

    const isVerified = user.verified;
    if (!isVerified)
      throw new ErrorResponse({
        statusCode: 401,
        code: USER_NOT_VERIFIED,
      });

    if (user && (await argon2.verify(user.password, password))) return user;

    // wrong password
    throw new ErrorResponse({
      statusCode: 401,
      code: INVALID_LOGIN,
    });
  }

  async generateJWT(user) {
    const { password, ...payload } = user; //seperate the password from the payload

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: TOKEN_LIFETIME,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('RT_SECRET'),
        expiresIn: RT_TOKEN_LIFETIME,
      }),
    ]);

    return { accessToken: at, refreshToken: rt };
  }

  async verifyAccount(input) {
    const { email, code } = input;
    // check if the user is exists and verified
    const user = await this.db.user.findFirst({
      where: {
        email,
      },
    });
    if (!user)
      throw new ErrorResponse({
        statusCode: 404,
        code: RESOURCE_NOT_FOUND,
        formmatingKeywords: ['user'],
      });
    if (user.verified)
      throw new ErrorResponse({
        statusCode: 401,
        code: ACCOUNR_ALREADY_VIRIFIED,
      });

    const verification = await this.db.verified_Codes.findFirst({
      where: {
        email,
      },
    });

    if (!verification)
      throw new ErrorResponse({
        statusCode: 401,
        code: NO_VERIFICATION_WAS_SENT,
      });

    if (verification.code !== code) {
      throw new ErrorResponse({
        statusCode: 401,
        code: INVALID_VERIFICATION_CODE,
      });
    }

    // make the user verified
    await this.db.user.update({
      where: {
        email,
      },
      data: { verified: true },
    });

    this.deletePreviousVerifiedCodes(email);

    return new SuccessResponse({
      data: true,
      code: ACCOUNT_VERIFIED,
    });
  }
}
