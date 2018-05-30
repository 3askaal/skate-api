'use strict';

const MatesController = require('./user.mates.controller');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'PUT',
      path: '/user/mates/request',
      config: {
        auth: 'token',
        handler: MatesController.requestMate,
      },
    },
    {
      method: 'PUT',
      path: '/user/mates/accept',
      config: {
        auth: 'token',
        handler: MatesController.acceptMate,
      },
    },
    {
      method: 'PUT',
      path: '/user/mates/remove',
      config: {
        auth: 'token',
        handler: MatesController.removeMate,
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'user-mates-routes',
  version: '1.0.0',
};
