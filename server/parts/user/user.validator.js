'use strict';

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validUsername = Joi.string()
  .min(3)
  .max(20)
  .required();
const validEmail = Joi.string()
  .email()
  .required();
const validPassword = Joi.string()
  .trim()
  .required();

const registerSchema = Joi.object({
  username: validUsername,
  email: validEmail,
  password: validPassword,
});

const logInSchema = Joi.alternatives().try(
  Joi.object({
    identifier: validUsername,
    password: validPassword,
  }),
  Joi.object({
    identifier: validEmail,
    password: validPassword,
  }),
);

module.exports = {
  registerSchema,
  logInSchema,
};
