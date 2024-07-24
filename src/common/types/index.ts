import { HttpStatus } from '@nestjs/common';

export type JwtPayload = {
  id: string;
  email?: string;
  phone: string;
  verified: boolean;
  image?: string;
  isAdmin: boolean;
};

export type AdminPayload = {
  permissions: string[];
  id: string;
  username: string;
};

export type ErrorResponseOptions = {
  success?: boolean;
  message?: string;
  statusCode?: HttpStatus;
  code?: string;
  formmatingKeywords?: string[];
};

export type SuccessResponseOptions = {
  success?: boolean;
  message?: string;
  statusCode?: HttpStatus;
  code?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};
export type CachedUserInfo = {
  image_src: string;
};
