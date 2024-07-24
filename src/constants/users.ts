import { Prisma } from '@prisma/client';

export const PUBLIC_FIELDS: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
};
export const PASSWORD_MIN_LENGTH = 6;
