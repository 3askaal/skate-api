'use strict';

// load deps
const Package = require('../package');
const fs = require('fs');
const path = require('path');
const Good = require('good');
const Hapi = require('hapi');
const Nes = require('nes');
const glob = require('glob');
const boomDecorators = require('hapi-boom-decorators');
const corsHeaders = require('hapi-cors-headers');

// load database
const db = require('./database');

// Configuration
const CONFIG = require('./config');

// instantiate a new server
const server = new Hapi.Server({
  load: {
    sampleInterval: 1000,
  },
});

// set the port for listening
server.connection({
  host: CONFIG.server.host,
  port: CONFIG.server.port,
  load: {
    maxHeapUsedBytes: 1073741824,
    maxRssBytes: 1610612736,
    maxEventLoopDelay: 5000,
  },
});

// Expose database
if (process.env.NODE_ENV === 'test') {
  server.database = db;
}

// // set up socket connection
// const io = require('socket.io')(server.listener);
//
// // sockets
// require('./rooms/lobby/_index')(io);
// require('./rooms/game/_index')(io);

// Auth
require('./auth')(server);

const plugins = [];

const crudRoutes = require('./crud/crud.routes');
plugins.push({ register: crudRoutes });

const essentialRoutes = require('./parts/essential/essential.routes');
const gameRoutes = require('./parts/game/game.routes');
const tournamentRoutes = require('./parts/tournament/tournament.routes');
const tagRoutes = require('./parts/tag/tag.routes');
const trickRoutes = require('./parts/trick/trick.routes');
const userRoutes = require('./parts/user/user.routes');
const userMatesRoutes = require('./parts/user/user.mates.routes');
const userStatsRoutes = require('./parts/user/user.stats.routes');

plugins.push({ register: essentialRoutes });
plugins.push({ register: gameRoutes });
plugins.push({ register: tournamentRoutes });
plugins.push({ register: tagRoutes });
plugins.push({ register: trickRoutes });
plugins.push({ register: userRoutes });
plugins.push({ register: userMatesRoutes });
plugins.push({ register: userStatsRoutes });

const socketOptions = require('./sockets/options.sockets');
plugins.push({ register: Nes, options: socketOptions.options });

const gameSockets = require('./sockets/game.sockets');
const lobbySockets = require('./sockets/lobby.sockets');
const chatSockets = require('./sockets/chat.sockets');

plugins.push({ register: gameSockets });
plugins.push({ register: lobbySockets });
plugins.push({ register: chatSockets });

const logs = require('./logs');
const docs = require('./docs');

plugins.push({ register: logs });
plugins.push({ register: docs });
// plugins.push({ register: boomDecorators });

server.ext('onPreResponse', corsHeaders);

server.register(plugins, (err) => {
  if (err) {
    throw err;
  }

  if (!module.parent) {
    server.start((err) => {
      if (err) {
        throw err;
      }

      server.log('Server running at: ' + server.info.uri);
    });
  }
});

module.exports = server;
