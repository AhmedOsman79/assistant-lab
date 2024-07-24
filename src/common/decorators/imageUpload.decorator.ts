import { UsePipes } from '@nestjs/common';
import { BODY_BASE64_IMAGE, MAX_PROFILE_IMAGE_SIZE_MB } from '@/constants';
import { FileUploadValidationPipe } from '@/users/pipes';

type UploadOptions = {
  imageName?: string;
  sizeInMb?: number;
  required?: boolean;
};
export const ImageSize = (options: UploadOptions) =>
  UsePipes(
    new FileUploadValidationPipe(
      options.imageName || BODY_BASE64_IMAGE,
      options.sizeInMb || MAX_PROFILE_IMAGE_SIZE_MB,
      options.required === undefined ? false : options.required,
    ),
  );
