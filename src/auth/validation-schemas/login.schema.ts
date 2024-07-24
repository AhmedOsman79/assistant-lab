import { PASSWORD_MIN_LENGTH } from '@/constants';
import * as Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
});
