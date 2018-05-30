'use strict';

const UserController = require('./user.controller');
const StatsController = require('./user.stats.controller');
const MatesController = require('./user.mates.controller');
const Validator = require('./user.validator');

const Verify = require('./utils/verify');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/user/stats/pos/{id}/{field}',
      config: {
        auth: 'token',
        handler: StatsController.getPosition,
      },
    },
    {
      method: 'POST',
      path: '/user/stats/reset',
      config: {
        auth: 'token',
        pre: [{ method: Verify.credentials, assign: 'user' }],
        handler: UserController.resetStats,
        validate: {
          payload: Validator.logInSchema,
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'user-stats-routes',
  version: '1.0.0',
};
