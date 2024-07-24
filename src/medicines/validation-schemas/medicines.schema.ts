import * as Joi from 'joi';
import { whenRequiredDosagePerDay } from './createMedicine.schema';

export const MedicinesSchema = Joi.object({
  medicines: Joi.array().items({
    days: Joi.number().strict().required(),
    startDatetime: Joi.string().isoDate().required(),
    dosagePerDay: Joi.alternatives()
      .try(Joi.string(), Joi.number())
      .required()
      .default(whenRequiredDosagePerDay),
    gapInDays: Joi.number().strict().default(0),
    dosageSchedule: Joi.object()
      .pattern(
        Joi.number().integer(),
        Joi.object({
          timestamp: Joi.string().isoDate(),
        }),
      )
      .required(),
    pauseMap: Joi.object()
      .pattern(
        Joi.string()
          .isoDate()
          .message('pauseMap key must be a valid ISO date string'),
        Joi.object({
          resumedAt: Joi.string().isoDate(),
        }),
      )
      .strict()
      .required(),

    // not required for the processing of the guest medicines
    name: Joi.string(),
    id: Joi.string(),
    userId: Joi.string(),
    image: Joi.string().allow(null),
    type: Joi.string().required(),
    subType: Joi.string().required(),
    dosage: Joi.number(),
  }),
  date: Joi.string().required(),
});
