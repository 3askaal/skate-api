'use strict';

const BOOM = require('boom');
const _ = require('lodash');
const Tournament = require('./tournament.model.js');
const TournamentController = require('./tournament.controller.js');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/tournament',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let config = request.payload;

          TournamentController.create(config)
            .then((res) => {
              reply(res);
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
      path: '/tournament/{id}/next',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let id = request.params.id;

          TournamentController.nextRound(id)
            .then((res) => {
              reply(res);
            })
            .catch((err) => {
              console.log('err', err);
              reply(BOOM.badRequest(err));
            });
        },
      },
    },
    {
      method: 'DELETE',
      path: '/tournament/{id?}',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let id = request.params.id;

          TournamentController.destroy(id)
            .then((res) => {
              reply(res);
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
  name: 'tournament-route',
  version: '1.0.0',
};
