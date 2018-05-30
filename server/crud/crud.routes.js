'use strict';

const CRUD = require('./crud.controllers');
const _ = require('lodash');
const Push = require('../communicate/push');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          reply({ index: 's.k.a.t.e API' });
        },
      },
    },

    {
      method: 'POST',
      path: '/push',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          const sender = request.payload.sender;
          const users = request.payload.users;
          const type = request.payload.type;

          Push(sender, users, type, function(data) {
            reply(data);
          });
        },
      },
    },

    // CREATE

    {
      method: 'POST',
      path: '/{col}',
      config: {
        auth: 'token',
        handler: CRUD.create,
        tags: ['api'],
        description: '[C]reate (in all collections)',
        notes: '[C]RUD',
      },
    },

    // READ

    {
      method: 'GET',
      path: '/{col}/{id*}',
      config: {
        auth: 'token',
        handler: CRUD.read,
        tags: ['api'],
        description: '[R]ead (in all collections)',
        notes: 'C[R]UD',
      },
    },

    // UPDATE

    {
      method: 'PUT',
      path: '/{col}/{id?}',
      config: {
        auth: 'token',
        handler: CRUD.update,
        tags: ['api'],
        description: '[U]pdate (in all collections)',
        notes: 'CR[U]D',
      },
    },

    // DELETE

    {
      method: 'DELETE',
      path: '/{col}/{id?}',
      config: {
        auth: 'token',
        handler: CRUD.destroy,
        tags: ['api'],
        description: '[D]estroy (in all collections)',
        notes: 'CRU[D]',
      },
    },
    {
      method: 'GET',
      path: '/favicon.ico',
      config: {
        handler: function() {
          return;
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'generic-route',
  version: '1.0.0',
};
