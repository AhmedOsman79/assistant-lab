import * as Joi from 'joi';

export const pasueAndResumeSchema = Joi.object({
  medicineId: Joi.string().required(),
});
