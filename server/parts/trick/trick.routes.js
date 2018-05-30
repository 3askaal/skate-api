'use strict';

const Trick = require('./trick.model');
const TrickController = require('./trick.controller');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/trick',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          TrickController.read()
            .then((game) => {
              reply(game);
            })
            .catch((err) => {
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
    {
      method: 'GET',
      path: '/trick/{essential}',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let essential = request.params.essential;

          Trick.find({ essential: essential })
            .then((trick) => {
              reply(trick);
            })
            .catch((err) => {
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
    {
      method: 'GET',
      path: '/trick/random/{difficulty}',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let difficulty = request.params.difficulty;

          Trick.random(difficulty)
            .then((trick) => {
              reply(trick);
            })
            .catch((err) => {
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'trick-route',
  version: '1.0.0',
};
