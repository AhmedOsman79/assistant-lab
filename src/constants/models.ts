import { Prisma } from '@prisma/client';

export const dbModels = Prisma.ModelName;
// convert models to object but in lowercase
const modelNamesLower = Object.keys(dbModels).reduce((acc, curr) => {
  //instead of making it lower case make the first character lower case only
  acc[curr] = dbModels[curr].charAt(0).toLowerCase() + dbModels[curr].slice(1);

  return acc;
}, {});

export const modelNames = modelNamesLower as Record<Prisma.ModelName, string>;
