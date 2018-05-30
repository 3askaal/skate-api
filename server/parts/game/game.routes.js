'use strict';

const BOOM = require('boom');
const GameController = require('./game.controller.js');
const Game = require('./game.model.js');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/game',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let config = request.payload;

          GameController.create(config)
            .then((game) => {
              reply(game);
            })
            .catch((err) => {
              console.log('err', err);
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
    {
      method: 'GET',
      path: '/game/{id}',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let id = request.params.id;

          GameController.read(id)
            .then((game) => {
              reply(game);
            })
            .catch((err) => {
              console.log('err', err);
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
    {
      method: 'GET',
      path: '/game/random',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          GameController.random()
            .then((game) => {
              reply(game);
            })
            .catch((err) => {
              console.log('err', err);
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'game-route',
  version: '1.0.0',
};
