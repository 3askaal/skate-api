'use strict';

const Vision = require('vision');
const Inert = require('inert');
const Swagger = require('hapi-swagger');
const Package = require('../package');

exports.register = (server, options, next) => {
  const swaggerOptions = {
    info: {
      title: 's.k.a.t.e API Documentation',
      version: Package.version,
    },
  };

  server.register(Vision);
  server.register(Inert);

  server.register({
    register: Swagger,
    options: swaggerOptions,
  });
};

exports.register.attributes = {
  name: 'docs',
  version: '1.0.0',
};
