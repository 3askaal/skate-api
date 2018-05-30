'use strict';

const EssentialController = require('./essential.controller');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/essential',
      config: {
        auth: 'token',
        handler: EssentialController.create,
      },
    },
    {
      method: 'DELETE',
      path: '/essential/{id?}',
      config: {
        auth: 'token',
        handler: EssentialController.destroy,
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'essential-route',
  version: '1.0.0',
};
