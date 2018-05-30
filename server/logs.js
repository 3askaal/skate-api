'use strict';

const Good = require('good');

exports.register = (server, options, next) => {
  const goodOptions = {
    ops: {
      interval: 1000,
    },
    reporters: {
      myConsoleReporter: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*' }],
        },
        {
          module: 'good-console',
        },
        'stdout',
      ],
    },
  };

  server.register({
    register: Good,
    options: goodOptions,
  });
};

exports.register.attributes = {
  name: 'logs',
  version: '1.0.0',
};
