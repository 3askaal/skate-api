'use strict';

const _ = require('lodash');
const BOOM = require('boom');

const GameController = require('../parts/game/game.controller');
const GameModel = require('../parts/game/game.model');

let LOBBIES = {};

exports.register = (server, options, next) => {
  server.subscription('/lobby/{host}');

  server.route([
    {
      method: 'POST',
      path: '/lobby/{host}/join',
      config: {
        handler: function(request, reply) {
          let host = request.params.host;
          let user = request.payload.user;

          request.socket.data = {
            host: host,
            user: user._id,
            isInLobby: true,
          };

          if (!LOBBIES[host]) {
            LOBBIES[host] = request.payload.data;
          }

          let player = _.find(LOBBIES[host].players, { _id: user._id });

          if (!player) {
            LOBBIES[host].players.push(user);
            player = _.find(LOBBIES[host].players, { _id: user._id });
          }

          player.active = true;

          server.publish(`/lobby/${host}`, {
            type: 'data:update',
            data: LOBBIES[host],
          });
        },
      },
    },
    {
      method: 'POST',
      path: '/lobby/{host}/settings',
      config: {
        handler: function(request, reply) {
          let host = request.params.host;
          let settings = request.payload;

          if (settings.word) {
            LOBBIES[host].word = settings.word;
          }

          if (settings.ref) {
            LOBBIES[host].ref = settings.ref;
          }

          server.publish(`/lobby/${host}`, {
            type: 'data:update',
            data: LOBBIES[host],
          });
        },
      },
    },
    {
      method: 'POST',
      path: '/lobby/{host}/start',
      config: {
        handler: function(request, reply) {
          let host = request.params.host;
          let config = request.payload;

          GameController.create(config)
            .then((GAME) => {
              GameController.read(GAME._id).then((GAME) => {
                server.publish(`/lobby/${host}`, {
                  type: 'game:created',
                  data: { game: GAME },
                });
              });
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

exports.disconnect = function(socket) {
  let host = socket.data.host;
  let user = socket.data.user;
  _.remove(LOBBIES[host].players, { _id: user });

  let activePlayers = _.filter(LOBBIES[host].players, 'active');

  if (activePlayers.length) {
    socket.server.publish(`/lobby/${host}/data`, {
      type: 'data:update',
      data: LOBBIES[host],
    });
  } else {
    delete LOBBIES[host];
  }
};

exports.register.attributes = {
  name: 'lobby-sockets',
  version: '1.0.0',
};
