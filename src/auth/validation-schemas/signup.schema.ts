import { PASSWORD_MIN_LENGTH } from '@/constants';
import * as Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().required().email(),
  name: Joi.string().required(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
  phone: Joi.string().required(),
});
