const _ = require('lodash');
const Tournament = require('./tournament.model.js');
const GameController = require('../game/game.controller');

function createTournamentGames(tournament, duals) {
  const games = [];

  _.forEach(duals, (dual) => {
    const game = {
      players: dual,
      tournament: tournament._id,
      word: tournament.word,
      status: 'scheduled',
    };

    games.push(game);
  });

  return games;
}

function createFirstRoundGames(tournament) {
  const duals = _.chunk(tournament.players, 2);
  const games = createTournamentGames(tournament, duals);

  return games;
}

function createNextRoundGames(tournament) {
  const latestRound = _.max(_.map(tournament.bracket, 'round'));
  const latestRoundGames = _.filter(tournament.bracket, { round: latestRound });
  const latestRoundWinners = _.map(latestRoundGames, 'winner');

  if (latestRoundWinners.length > 1) {
    const nextRoundDuals = _.chunk(latestRoundWinners, 2);
    const games = createTournamentGames(tournament, nextRoundDuals);
    return games;
  } else {
    return [];
  }
}

function destroyAllGames(tournament) {
  return Game.find({ tournament: tournament }).remove();
}

function isReadyForNextRound(tournament) {
  const latestRound = _.max(_.map(tournament.bracket, 'round'));
  const latestRoundGames = _.filter(tournament.bracket, { round: latestRound });
  const latestRoundDone = _.every(latestRoundGames, 'winner');

  if (latestRoundDone) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  createFirstRoundGames,
  createNextRoundGames,
  destroyAllGames,
  isReadyForNextRound,
};
