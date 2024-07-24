import { ContactStatus } from '@prisma/client';
import * as Joi from 'joi';
import { base64JoiValidation } from '@/utils/validation';

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  base64Image: base64JoiValidation,
  email: Joi.string().email(),
  status: Joi.string().valid(...Object.keys(ContactStatus)),
  availableFrom: Joi.string(),
  availableUntil: Joi.string(),
});
