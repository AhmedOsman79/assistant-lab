import { Injectable, PipeTransform } from '@nestjs/common';
import { ErrorResponse } from '@/common/response';
import { IMAGE_TOO_LARGE, INVALID_BASE64, NO_BASE64_IMAGE } from '@/constants';

@Injectable()
export class FileUploadValidationPipe implements PipeTransform<any> {
  constructor(
    private readonly imageFieldName: string,
    private readonly sizeInMb: number,
    private readonly isRequired: boolean,
  ) {}
  async transform(value: string) {
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;

    let base64Image = '';

    if (typeof value === 'object')
      base64Image = value ? value[this.imageFieldName] : null;
    else return value;

    if (!base64Image && !this.isRequired) return value;

    if (!base64Image)
      throw new ErrorResponse({
        statusCode: 404,
        code: NO_BASE64_IMAGE,
        formmatingKeywords: [this.imageFieldName],
      });

    if (!base64Regex.test(base64Image)) {
      throw new ErrorResponse({
        statusCode: 400,
        code: INVALID_BASE64,
      });
    }

    // Convert base64 data to a Buffer
    const base64Data = base64Image.replace(base64Regex, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const imageSize = imageBuffer.length;
    const maxFileSize = this.sizeInMb * 1024 * 1024;

    if (imageSize > maxFileSize) {
      throw new ErrorResponse({
        statusCode: 400,
        code: IMAGE_TOO_LARGE,
        formmatingKeywords: [this.sizeInMb.toString()],
      });
    }

    // If everything is valid, return the body
    return value;
  }
}
