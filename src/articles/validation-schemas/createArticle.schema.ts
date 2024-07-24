import { Locales } from '@prisma/client';
import * as Joi from 'joi';
import { base64JoiValidation } from '@/utils/validation';

const numberOfAllowedLocales = Object.keys(Locales).length;

export const createArticleSchema = Joi.object({
  image: base64JoiValidation.required(),
  data: Joi.array()
    .required()
    .min(numberOfAllowedLocales)
    .message(
      `must provide ${numberOfAllowedLocales} locales : ${Object.values(
        Locales,
      )}`,
    )
    .items(
      Joi.object({
        langCode: Joi.string()
          .required()
          .valid(...Object.values(Locales)),
        title: Joi.string().required(),
        content: Joi.string().required(),
      }),
    ),
});
