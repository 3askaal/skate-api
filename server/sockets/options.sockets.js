const ChatSocket = require('./chat.sockets');
const GameSocket = require('./game.sockets');
const LobbySocket = require('./lobby.sockets');

exports.options = {
  onDisconnection: function(socket) {
    if (socket.data && socket.data.isInLobby) {
      LobbySocket.disconnect(socket);
    }

    if (socket.data && socket.data.isInGame) {
      GameSocket.disconnect(socket);
    }
  },
};

exports.register = {};

exports.register.attributes = {
  name: 'socket-options',
  version: '1.0.0',
};
