const Joi = require("joi");

const responseSchema = Joi.object({
  status: Joi.string().required(),
  message: Joi.string().required(),
  data: Joi.any().required(),
}).label("default response");

module.exports = responseSchema;
