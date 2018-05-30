'use strict';

const Tournament = require('./tournament.model.js');
const TournamentHelpers = require('./tournament.helpers.js');
const Game = require('../game/game.model.js');
const GameController = require('../game/game.controller.js');
const _ = require('lodash');

function create(config) {
  config.players = _.shuffle(config.players);

  return Tournament.create(config)
    .then((tournament) => {
      let tournamentGames = TournamentHelpers.createFirstRoundGames(tournament);

      return GameController.create(tournamentGames)
        .then((games) => {
          games.forEach((game) => {
            tournament.bracket.push({
              round: 1,
              game: game._id,
              players: _.map(game.players, 'player'),
            });
          });

          return tournament
            .save()
            .then((tournament) => {
              return Promise.resolve({
                message: 'Tournament created',
                data: { tournament: tournament, games: games },
              });
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function destroy(id) {
  return Tournament.find(id)
    .remove()
    .then(() => {
      return TournamentHelpers.destroyAllGames(id)
        .then(() => {
          return Promise.resolve({ message: 'Tournament and games deleted' });
        })
        .catch((err) => {
          console.log('err', err);
          return Promise.reject(err);
        });
    })
    .catch((err) => {
      console.log('err', err);
      return Promise.reject(err);
    });
}

module.exports = {
  create,
  destroy,
};
