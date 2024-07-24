import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { ErrorResponse, SuccessResponse } from '@/common/response';
import {
  BOTH_OR_NONE,
  CONTACT_ADDED,
  PERMISSION_ERROR,
  RESOURCE_NOT_FOUND,
} from '@/constants';
import { modelNames } from '@/constants/models';
import { PrismaService } from '@/database/prisma.service';
import { bothOrNone } from '@/utils/bothOrNone';
import { formatTime } from '@/utils/convertTime';
import { ContactType } from './pipes/contactType.pipe';
import { ContactStatus } from '@prisma/client';
import { createContactDTO, updateContactDTO } from '@/interfaces';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getContactById(id: string, type: ContactType, userId?: string) {
    const modelName = this.getModelNameByType(type);
    const contact = await this.prisma[modelName].findFirst({
      where: { id },
    });
    if (!contact)
      throw new ErrorResponse({
        statusCode: 404,
        code: RESOURCE_NOT_FOUND,
        formmatingKeywords: [type],
      });

    if (userId) {
      // will check the permission then
      if (contact.userId !== userId)
        throw new ErrorResponse({
          statusCode: 403,
          code: PERMISSION_ERROR,
        });
    }
    return contact;
  }

  async getSingleContact(userId: string, contactId: string, type: ContactType) {
    const contact = await this.getContactById(contactId, type, userId);
    return contact;
  }

  async getMyContacts(userId: string, type) {
    return await this.prisma[this.getModelNameByType(type)].findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private getAvailability(from?: string, until?: string): string | undefined {
    if (!bothOrNone(from, until)) {
      this.throwBothOrNoneErrorForAvailability();
    }
    const availability =
      from && until ? `${formatTime(from)},${formatTime(until)}` : undefined;

    return availability;
  }

  async createNewContact(
    userId: string,
    data: createContactDTO,
    type: ContactType,
  ) {
    const {
      availableFrom,
      availableUntil,
      base64Image,
      status,
      email,
      ...commomData
    } = data;

    const modelName = this.getModelNameByType(type);
    const createData = { ...commomData, userId };

    if (type === 'assistant') {
      // assistant has status
      createData['status'] = status;
    }
    if (type === 'doctor') {
      // doctors hav availability and email
      const availability = this.getAvailability(availableFrom, availableUntil);
      createData['availability'] = availability;
      createData['email'] = email;
    }

    const newContact = await this.prisma[modelName].create({
      data: createData,
    });

    if (base64Image) {
      const [, img_url] = await this.cloudinary.updateImageNoValidation(
        newContact.id,
        modelName,
        base64Image,
      );
      newContact.image = img_url;
    }

    if (type === 'assistant') {
      const assistantStatus = status as ContactStatus;

      // for emergency and hotlines we only need one contact for each type
      if (assistantStatus !== 'normal') {
        // remove reserved status from all contacts
        // don't block the execution for this
        this.removeContactReservedSatatus(
          userId,
          type,
          assistantStatus,
          newContact.id,
        );
      }
    }

    return new SuccessResponse({
      data: newContact,
      code: CONTACT_ADDED,
    });
  }

  async updateContact(
    currentUserId: string,
    contactId: string,
    data: updateContactDTO,
    type: ContactType,
  ) {
    // check if the contact exist and if the current user has permission to edit or not
    await this.getContactById(contactId, type, currentUserId);

    const modelName = this.getModelNameByType(type);
    const {
      availableFrom,
      availableUntil,
      base64Image,
      status,
      email,
      ...commonUpdateData
    } = data;

    const updateData = { ...commonUpdateData };
    if (type === 'assistant') {
      updateData['status'] = status;
    }
    if (type === 'doctor') {
      updateData['email'] = email;
      const availability = this.getAvailability(availableFrom, availableUntil);
      updateData['availability'] = availability;
    }

    const updateRes = await this.prisma.contacts.update({
      where: { id: contactId },
      data: {
        ...updateData,
      },
    });

    if (base64Image) {
      const [, imgUrl] = await this.cloudinary.updateImageNoValidation(
        contactId,
        modelName,
        base64Image,
        true,
      );
      updateRes.image = imgUrl;
    }

    if (type === 'assistant' && status) {
      const assistantStatus = status as ContactStatus;

      // for emergency and hotlines we only need one contact for each type
      if (assistantStatus !== 'normal') {
        // remove reserved status from all contacts
        // don't block the execution for this
        this.removeContactReservedSatatus(
          currentUserId,
          type,
          assistantStatus,
          contactId,
        );
      }
    }

    return updateRes;
  }

  private throwBothOrNoneErrorForAvailability() {
    throw new ErrorResponse({
      code: BOTH_OR_NONE,
      formmatingKeywords: ['availableFrom', 'availableUntil'],
      statusCode: 400,
    });
  }

  private getModelNameByType(type: ContactType): string {
    if (type === 'assistant') return modelNames.Contacts;
    if (type === 'doctor') return modelNames.Doctor;
    return '';
  }

  private async removeContactReservedSatatus(
    userId: string,
    type: ContactType,
    status: ContactStatus,
    execludeId: string,
  ) {
    if (type === 'assistant') {
      await this.prisma.contacts.updateMany({
        where: { AND: { id: { not: execludeId }, status, userId } },
        data: { status: 'normal' },
      });
    }
  }
}
