import * as Joi from 'joi';

export const makeArticleHotSchema = Joi.object({
  articleId: Joi.string().required(),
});
