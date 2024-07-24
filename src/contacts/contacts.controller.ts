import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UseValidation, getCurrentUser } from '@/common/decorators';
import { CONTANCTS_BASE_URL } from '@/constants';
import { ContactsService } from './contacts.service';
import { createContactSchema, updateContactSchema } from './validation-schemas';
import { ContactQuery } from './pipes/contactType.pipe';
import { ImageSize } from '@/common/decorators/imageUpload.decorator';

@Controller(CONTANCTS_BASE_URL)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async getMyContacts(
    @getCurrentUser('id') currentUserId,
    @ContactQuery() type,
  ) {
    return await this.contactsService.getMyContacts(currentUserId, type);
  }

  @Get('/:id')
  async getSingleContact(
    @getCurrentUser('id') currentUserId,
    @Param('id') contactId,
    @ContactQuery() type,
  ) {
    return await this.contactsService.getSingleContact(
      currentUserId,
      contactId,
      type,
    );
  }

  @Post()
  @UseValidation(createContactSchema)
  @ImageSize({ sizeInMb: 2 })
  async createANewContact(
    @Body() data,
    @getCurrentUser('id') currentUserId,
    @ContactQuery() type,
  ) {
    return await this.contactsService.createNewContact(
      currentUserId,
      data,
      type,
    );
  }

  @Put('/:id')
  @UseValidation(updateContactSchema)
  @ImageSize({ sizeInMb: 2, required: false })
  async updateExistingContact(
    @Body() data,
    @getCurrentUser('id') currentUserId,
    @Param('id') contactId,
    @ContactQuery() type,
  ) {
    return await this.contactsService.updateContact(
      currentUserId,
      contactId,
      data,
      type,
    );
  }
}
