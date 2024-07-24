import { VERIFICATION_CODE_LENGTH } from '@/constants';
import * as Joi from 'joi';

export const verifyAccountSchema = Joi.object({
  code: Joi.string().required().length(VERIFICATION_CODE_LENGTH),
  email: Joi.string().required().email(),
});
