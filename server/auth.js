'use strict';

const JWT = require('hapi-auth-jwt');

const CONFIG = require('./config');

module.exports = function(server) {
  server.register(JWT);

  server.auth.strategy('token', 'jwt', {
    key: CONFIG.token.secret,
    verifyOptions: { algorithms: [CONFIG.token.algorithm] },
  });
};
