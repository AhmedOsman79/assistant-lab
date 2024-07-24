import { PrismaService } from '../database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PUBLIC_FIELDS, QR_LIFETIME } from '@/constants';
import { modelNames } from '@/constants/models';
import { BaseService } from '@/common/base';
import { signupDTO, updateUserDTO } from '@/interfaces';

@Injectable()
export class UsersService extends BaseService<
  User,
  Prisma.UserSelect,
  Prisma.UserInclude
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    super(prisma, modelNames.User);
  }

  async findByEmail(email: string, select: Prisma.UserSelect = null) {
    return await this.findByField('email', email, select, false);
  }

  async createUser(userData: signupDTO) {
    const hash = await argon2.hash(userData.password);
    delete userData.password;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hash,
      },
      select: PUBLIC_FIELDS,
    });

    return user;
  }

  async updateProfilePicture(currentUserId: string, base64Image: string) {
    return await this.cloudinary.updateImageNoValidation(
      currentUserId,
      modelNames.User,
      base64Image,
      true,
    );
  }

  async updateUserInfo(userId: string, data: updateUserDTO) {
    const { base64Image, ...updateData } = data;
    if (base64Image) await this.updateProfilePicture(userId, base64Image);
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async generateHashedQrCode(user) {
    const token = await this.jwt.signAsync(
      {
        id: user.id,
        name: user.name,
      },
      {
        secret: this.config.get('QR_SECRET'),
        expiresIn: QR_LIFETIME,
      },
    );

    return { qrCode: token };
  }
}
