import { SuccessResponseOptions } from '../types';

export class SuccessResponse {
  code;
  statusCode;
  data;
  constructor(options: SuccessResponseOptions) {
    this.statusCode = options.statusCode || 200;
    this.code = options.code;
    this.data = options.data;
  }
}
