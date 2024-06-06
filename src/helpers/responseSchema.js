const Joi = require("joi");

const defaultResponseSchema = Joi.object({
  statusCode: Joi.number().min(100).max(599).required(),
  error: Joi.any().required(),
  message: Joi.string().required(),
  data: Joi.any().optional(),
}).label("default response");

module.exports = { defaultResponseSchema };
