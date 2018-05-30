'use strict';

// const Controller = require('../entities/game/game.controller');
// const Game = require('../entities/game/game.model');

// Utils

// Libs
const _ = require('lodash');

let STORAGE = {};

exports.register = (server, options, next) => {
  // server.subscription('/lobby/{host}/players');

  server.subscription('/chat/{room}');

  server.route([
    {
      method: 'POST',
      path: '/chat/{room}/msg',
      config: {
        handler: function(request, reply) {
          let host = request.params.host;
          let user = request.payload.user;

          let message = request.payload.message;
        },
      },
    },
  ]);

  next();
};

// exports.options = {
//   onDisconnection: function(socket) {
//
//     let room = socket.data.room;
//     let user = socket.data.user;
//
//     STORAGE[room].disconnected.push(user);
//
//     socket.server.publish(`/lobby/${host}/players`, {
//       type: 'user:disconnected',
//       data: { user: user }
//     });
//   }
// }

exports.register.attributes = {
  name: 'chat-sockets',
  version: '1.0.0',
};
