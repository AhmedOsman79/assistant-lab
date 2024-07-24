import { MedicineSubType, MedicineType } from '@prisma/client';
import * as Joi from 'joi';
import { base64JoiValidation } from '@/utils/validation';

export const whenRequiredDosagePerDay = 'WHEN_REQUIRED';

export const createMedicineSchema = Joi.object({
  name: Joi.string().required(),
  image: base64JoiValidation,

  type: Joi.string()
    .required()
    .valid(...Object.values(MedicineType)),

  subType: Joi.string().valid(...Object.values(MedicineSubType)),

  dosage: Joi.number().strict().required(),

  dosagePerDay: Joi.string().default(whenRequiredDosagePerDay),

  days: Joi.number().strict().required(),

  startDatetime: Joi.string().isoDate().required(),

  gapInDays: Joi.number().strict(), // default is 0 in the database
});
