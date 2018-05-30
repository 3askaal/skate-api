'use strict';

const UserController = require('./user.controller');
const StatsController = require('./user.stats.controller');
const MatesController = require('./user.mates.controller');
const Validator = require('./user.validator');

const Verify = require('./utils/verify');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/user/register',
      config: {
        auth: false,
        pre: [{ method: Verify.unique }],
        handler: UserController.register,
        validate: {
          payload: Validator.registerSchema,
        },
      },
    },
    {
      method: 'POST',
      path: '/user/login',
      config: {
        auth: false,
        pre: [{ method: Verify.credentials, assign: 'user' }],
        handler: UserController.logIn,
        validate: {
          payload: Validator.logInSchema,
        },
      },
    },
    {
      method: 'POST',
      path: '/user/password/forgot',
      config: {
        auth: false,
        pre: [{ method: Verify.credentials, assign: 'user' }],
        handler: UserController.forgotPassword,
        validate: {
          payload: Validator.logInSchema,
        },
      },
    },
    {
      method: 'POST',
      path: '/user/password/change',
      config: {
        auth: false,
        pre: [{ method: Verify.credentials, assign: 'user' }],
        handler: UserController.changePassword,
        validate: {
          payload: Validator.logInSchema,
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'user-routes',
  version: '1.0.0',
};
