const Joi = require("joi");

const schemas = {
  addCard: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    expiry_date: Joi.string().required(),
    number: Joi.any().required(),
    cvv: Joi.any().required(),
  }),
  fund: Joi.object().keys({
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
    card_id: Joi.any().required(),
  }),
  cardPay: Joi.object().keys({
    orderId: Joi.string().required(),
    amount: Joi.number().required(),
    card_id: Joi.any().required(),
  }),
  walletPay: Joi.object().keys({
    recipient: Joi.string().required(),
    amount: Joi.number().required(),
    description: Joi.string(),
  }),
  verifyOtp: Joi.object().keys({
    otp: Joi.any().required(),
    reference: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
  verifyPin: Joi.object().keys({
    pin: Joi.any().required(),
    reference: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
};
module.exports = schemas;
