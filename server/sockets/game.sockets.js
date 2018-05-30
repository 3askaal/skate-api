'use strict';

const _ = require('lodash');
const BOOM = require('boom');

const Game = require('../parts/game/game.model');
const GameController = require('../parts/game/game.controller');

// Storage
let GAMES = {};

function activateGame(room, cb) {
  GameController.read(room)
    .then((game) => {
      GAMES[room] = game;
      cb();
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

function activatePlayer(room, user) {
  let player = _.find(GAMES[room].players, { player: { _id: user } });
  player.active = true;
}

function deactivatePlayer(room, user) {
  let player = _.find(GAMES[room].players, { player: { _id: user } });
  player.active = false;
}

exports.register = (server, options, next) => {
  server.subscription('/game/{room}');

  server.route([
    // JOIN
    {
      method: 'POST',
      path: '/game/{room}/join',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;
          let user = request.payload.user;

          request.socket.data = {
            room: room,
            user: user,
            isInGame: true,
          };

          if (!GAMES[room]) {
            activateGame(room, () => {
              server.publish(`/game/${room}`, {
                type: 'data:ready',
                data: GAMES[room],
              });
            });
          } else {
            server.publish(`/game/${room}`, {
              type: 'data:ready',
              data: GAMES[room],
            });
          }
        },
      },
    },

    // JOIN
    {
      method: 'POST',
      path: '/game/{room}/active',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;
          let user = request.payload.user;

          activatePlayer(room, user);

          server.publish(`/game/${room}`, {
            type: 'data:ready',
            data: GAMES[room],
          });
        },
      },
    },

    // REMOVE PLAYER
    // {
    //   method: 'POST',
    //   path: '/game/{room}/removeplayer',
    //   config: {
    //     auth: 'token',
    //     handler: function(request, reply) {
    //
    //       let room = request.params.room;
    //       let user = request.payload.user;
    //
    //       GameController.removePlayer(room, user)
    //         .then((game) => {
    //
    //           GAMES[room] = game;
    //
    //           server.publish(`/game/${room}/data`, GAMES[room]);
    //           server.publish(`/game/${room}/state`, {
    //             type: 'user:removed',
    //             data: {
    //               user: user
    //             }
    //           });
    //         });
    //     }
    //   }
    // },

    // TRICK
    {
      method: 'POST',
      path: '/game/{room}/trick',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;
          let trick = request.payload.trick;

          server.publish(`/game/${room}`, {
            type: 'trick:chosen',
            data: trick,
          });
        },
      },
    },

    // DEFENSE
    {
      method: 'POST',
      path: '/game/{room}/defense',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;
          let defense = request.payload.defense;

          server.publish(`/game/${room}`, { type: 'defense', data: defense });
        },
      },
    },

    // APPLY
    {
      method: 'POST',
      path: '/game/{room}/apply',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;
          let turn = request.payload.turn;

          GameController.referee(room, turn)
            .then((res) => {
              if (request.socket) {
                server.publish(`/game/${room}`, res);
              } else {
                reply(res);
              }
            })
            .catch((err) => {});
        },
      },
    },

    // PASS
    {
      method: 'GET',
      path: '/game/{room}/pass',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;

          GameController.pass(room).then((game) => {
            if (request.socket) {
              server.publish(`/game/${room}`, {
                type: 'next:player',
                data: game,
              });
            } else {
              reply({ type: 'next:player', data: game });
            }
          });
        },
      },
    },

    // PAUZE
    {
      method: 'GET',
      path: '/game/{room}/pause',
      config: {
        auth: 'token',
        handler: function(request, reply) {
          let room = request.params.room;

          GameController.pause(room).then((game) => {
            if (request.socket) {
              server.publish(`/game/${room}`, {
                type: 'game:paused',
                data: game,
              });
            } else {
              reply({ type: 'game:paused', data: game });
            }
          });
        },
      },
    },
  ]);

  next();
};

exports.disconnect = function(socket) {
  let room = socket.data.room;
  let user = socket.data.user;

  // set active to false
  deactivatePlayer(room, user);

  // check amount active players
  let activePlayers = _.filter(GAMES[room].players, 'active');

  // if active players
  if (activePlayers.length) {
    // send data
    socket.server.publish(`/game/${room}/data`, GAMES[room]);
  } else {
    // remove game data
    delete GAMES[room];
  }
};

exports.register.attributes = {
  name: 'game-sockets',
  version: '1.0.0',
};
