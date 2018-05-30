const _ = require('lodash');

function createGameConfig(config) {
  config.players = _.shuffle(config.players);
  config.players = createGamePlayersConfig(config.players);
  if (!config.current) {
    config.current = config.players[0].player;
  }
  return config;
}

function createGamePlayersConfig(dual) {
  let players = [];

  _.forEach(dual, function(player) {
    players.push({ player: player });
  });

  return players;
}

function getRemainingPlayers(game) {
  return _.filter(game.players, (player) => {
    return player.letters < game.word.length;
  });
}

function getWinner(game) {
  let remainingPlayers = getRemainingPlayers(game);
  return remainingPlayers[0].player._id;
}

function isGameOver(game) {
  let remainingPlayers = getRemainingPlayers(game);

  if (remainingPlayers.length === 1) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  createGameConfig,
  getWinner,
  isGameOver,
};
