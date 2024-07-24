import { PipeTransform, Injectable, Query } from '@nestjs/common';
import { UNKNOWN_CONTACT_TYPE } from '@/constants';
import { ErrorResponse } from '@/common/response';
import { CONTACT_TYPE } from '@/types';

export type ContactType = keyof typeof CONTACT_TYPE;

@Injectable()
export class ContactTypePipe implements PipeTransform {
  transform(value: string) {
    if (Object.keys(CONTACT_TYPE).includes(value)) {
      return value;
    }
    throw new ErrorResponse({
      statusCode: 400,
      code: UNKNOWN_CONTACT_TYPE,
    });
  }
}
export const ContactQuery = () => Query('type', ContactTypePipe);
