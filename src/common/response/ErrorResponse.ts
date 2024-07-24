import { HttpException } from '@nestjs/common';
import { ErrorResponseOptions } from '../types';

export class ErrorResponse extends HttpException {
  constructor(options: ErrorResponseOptions) {
    options.success = false;
    options.statusCode = options.statusCode || 500;
    // options['message'] = options.msg;
    // delete options.msg;
    super(options, options.statusCode);
  }
}
