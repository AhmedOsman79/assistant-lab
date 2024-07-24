import * as Joi from 'joi';
import { base64JoiValidation } from '@/utils/validation';

export const updateUserSchema = Joi.object({
  base64Image: base64JoiValidation,
  phone: Joi.string(),
});
