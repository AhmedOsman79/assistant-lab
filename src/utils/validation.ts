import * as Joi from 'joi';

export const base64JoiValidation = Joi.string()
  .allow(null)
  .regex(/^data:image\/(jpeg|jpg|png|gif);base64,/);
