import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorResponse } from '@/common/response';
import { PERMISSION_ERROR, RESOURCE_NOT_FOUND } from '@/constants';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DiseaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId?: string) {
    const disease = await this.prisma.disease.findFirst({ where: { id } });

    if (!disease)
      throw new ErrorResponse({
        statusCode: 404,
        code: RESOURCE_NOT_FOUND,
        formmatingKeywords: ['disease'],
      });

    if (userId) {
      // will check the permission then
      if (disease.userId !== userId)
        throw new ErrorResponse({
          statusCode: 403,
          code: PERMISSION_ERROR,
        });
    }
    return disease;
  }
  async getDiseasesOfUser(userId: string) {
    return this.prisma.disease.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        since: true,
      },
    });
  }

  async create(userId: string, data) {
    const inputData: Prisma.DiseaseCreateInput = {
      ...data,
      user: { connect: { id: userId } },
      since: new Date(data.since),
    };
    return await this.prisma.disease.create({
      data: inputData,
    });
  }
  async update(userId: string, diseaseId: string, data) {
    await this.findById(diseaseId, userId);

    const updateData: Prisma.DiseaseUpdateInput = {
      ...data,
    };
    if (data.since) {
      updateData.since = new Date(data.since);
    }

    return await this.prisma.disease.update({
      where: { id: diseaseId },
      data: updateData,
    });
  }

  async delete(currentUserId, diseaseId) {
    // make sure the user is the owner of this disease
    await this.findById(diseaseId, currentUserId);

    return this.prisma.disease.delete({
      where: { id: diseaseId },
    });
  }
}
