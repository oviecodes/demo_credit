const Joi = require("joi");

const schemas = {
  register: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};
module.exports = schemas;
