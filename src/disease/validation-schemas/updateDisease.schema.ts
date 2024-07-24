import * as Joi from 'joi';
import * as JoiDate from '@joi/date';

const joi = Joi.extend(JoiDate.default(Joi)) as typeof Joi;

export const updateDiseaseSchema = Joi.object({
  title: joi.string(),
  since: joi.date().format('YYYY-MM-DD'),
});
