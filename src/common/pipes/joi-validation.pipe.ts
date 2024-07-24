import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { ErrorResponse } from '../response';
import { VALIDATION_ERROR } from '@/constants';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'object') return value;

    const { error } = this.schema.validate(value);
    if (error) {
      throw new ErrorResponse({
        success: false,
        statusCode: 400,
        message: error.message,
        code: VALIDATION_ERROR,
      });
    }
    return value;
  }
}
