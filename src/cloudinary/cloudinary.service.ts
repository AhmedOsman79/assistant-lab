import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { ErrorResponse } from '@/common/response';
import { RESOURCE_NOT_FOUND } from '@/constants';
import { PrismaService } from '@/database/prisma.service';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadImage(
    file: Express.Multer.File | null,
    base64: string | null,
  ): Promise<UploadApiResponse | UploadApiErrorResponse | string> {
    return new Promise((resolve, reject) => {
      if (base64) {
        return v2.uploader
          .upload(base64, {
            resource_type: 'image',
          })
          .then((uploadedImageRes) => {
            resolve(uploadedImageRes.secure_url);
          });
      }
      if (file) {
        const upload = v2.uploader.upload_stream((error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        Readable.from(file.buffer).pipe(upload); // covert buffer to readable stream
      }
    });
  }
  getImageNameByUrl(url: string) {
    const arr = url.split('/');
    const imageWithPrefix = arr[arr.length - 1];

    return imageWithPrefix.split('.')[0];
  }

  async deleteImage(url: string): Promise<void> {
    const imageName = this.getImageNameByUrl(url);
    await v2.uploader.destroy(imageName);
  }

  async updateImageNoValidation(
    resourceId: string,
    collection: string,
    base64Image: string,
    checkPrevImageAndDeleteIt = false,
    imageFieldName = 'image',
  ) {
    // note we don't authorize if the user has access to update the resource or
    // not , this should be done in the main service method which using this helper method
    if (checkPrevImageAndDeleteIt) {
      const resource = await this.prisma[collection].findFirst({
        where: { id: resourceId },
      });

      if (!resource)
        throw new ErrorResponse({
          statusCode: 404,
          code: RESOURCE_NOT_FOUND,
          formmatingKeywords: ['resource'],
        });

      if (
        resource[imageFieldName] &&
        resource[imageFieldName].includes('res.cloudinary.com')
      ) {
        // there is a cloudinary image for this resource
        this.deleteImage(resource.image);
      }
    }
    const img_url = (await this.uploadImage(null, base64Image)).toString();

    const updateRes = await this.prisma[collection].update({
      where: { id: resourceId },
      data: { [imageFieldName]: img_url },
    });

    return [updateRes, img_url];
  }
}
