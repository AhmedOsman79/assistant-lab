import * as Joi from 'joi';

export const setTakenSchema = Joi.object({
  medicineId: Joi.string().required(),
  dosageOrder: Joi.number().required(),
});
