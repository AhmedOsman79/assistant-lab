import { PipeTransform, Injectable } from '@nestjs/common';
import { ErrorResponse } from '../response';
import { LOCALE_NOT_SUPPORTED } from '@/constants';
import { Locales } from '@prisma/client';

@Injectable()
export class LangPipe implements PipeTransform {
  transform(value: string) {
    if (Object.values(Locales).find((l) => l == value)) {
      return value;
    }
    throw new ErrorResponse({
      statusCode: 400,
      code: LOCALE_NOT_SUPPORTED,
    });
  }
}
