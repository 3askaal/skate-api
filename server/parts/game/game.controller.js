'use strict';

const BOOM = require('boom');
const Game = require('./game.model.js');
const GameHelpers = require('./game.helpers.js');
const Tournament = require('../tournament/tournament.model.js');
const TournamentHelpers = require('../tournament/tournament.helpers.js');
const Trick = require('../trick/trick.model.js');
const User = require('../user/user.model.js');
const POINTS = require('../../constants/points.js');
const _ = require('lodash');

let STATUS = null;

function read(id) {
  return Game.findById(id)
    .populate('turns.player', 'username')
    .populate('turns.good', 'username')
    .populate('turns.fail', 'username')
    .populate('players.player', 'username')
    .deepPopulate('turns.trick.essential');
}

function create(config) {
  if (config.length) {
    _.forEach(config, (eachConfig) => {
      eachConfig = GameHelpers.createGameConfig(eachConfig);
    });
  } else {
    config = GameHelpers.createGameConfig(config);
  }

  return Game.create(config);
}

function destroyTournamentGames(tournament) {
  return Game.find({ tournament: tournament }).remove();
}

function pass(id) {
  return Game.findById(id).then((game) => {
    let playerIndex = _.findIndex(game.players, { player: game.current });
    playerIndex++;
    let next = game.players[playerIndex];

    while (!next || next.lost) {
      if (!next) {
        next = game.players[0];
      }

      if (next.lost) {
        playerIndex++;
        next = game.players[playerIndex];
      }
    }

    game.current = next.player;

    return game.save((err, game) => {
      if (err) {
        return Promise.reject(err);
      } else {
        return Promise.resolve(game);
      }
    });
  });
}

function pause(id) {
  return Game.findById(id).then((game) => {
    game.status = 'paused';

    return game.save((err, game) => {
      if (err) {
        return Promise.reject(err);
      } else {
        return Promise.resolve(game);
      }
    });
  });
}

async function referee(id, turn) {
  let game = await Game.findById(id).populate('players.player', 'username');

  if (!GameHelpers.isGameOver(game)) {
    await addTurnAndLetters(game, turn);

    game = await Game.findById(id)
      .populate('turns.player', 'username')
      .populate('turns.good', 'username')
      .populate('turns.fail', 'username')
      .populate('players.player', 'username')
      .deepPopulate('turns.trick.essential');

    return Promise.resolve({
      message: 'Defense applied',
      type: 'defense:applied',
      data: game,
    });
  } else {
    let winner = GameHelpers.getWinner(game);
    game = await onGameOver(game, winner);
    game = await report(game);
    await reward(game);

    if (game.tournament) {
      return finishTournamentGame(game);
    } else {
      return Promise.resolve(game);
    }
  }
}

function addTurnAndLetters(game, turn) {
  game.turns.push(turn);
  game.players.forEach((player) => {
    if (player.player._id === turn.player) {
      player.report.lettersGiven += turn.fail.length;
    }

    turn.fail.forEach((noob) => {
      if (!player.report.l) {
        if (player.player._id === noob) {
          player.letters++;
        }

        if (player.letters === game.word.length) {
          player.report.l = 1;
          player.report.lostAtTurn = game.turns.length;
        }
      }
    });
  });

  return game.save();
}

function onGameOver(game, winner) {
  game.status = 'over';
  game.winner = winner;
  return game.save();
}

async function finishTournamentGame(game) {
  let tournament = await Tournament.findById(game.tournament);
  let tournamentGame = _.find(tournament.bracket, { game: game._id });
  tournamentGame.winner = game.winner;
  tournament = await tournament.save();

  if (TournamentHelpers.isReadyForNextRound(tournament)) {
    let nextRoundGames = TournamentHelpers.createNextRoundGames(tournament);

    if (nextRoundGames.length) {
      let games = await create(nextRoundGames);
      let latestRound = _.max(_.map(tournament.bracket, 'round'));

      games.forEach((game) => {
        tournament.bracket.push({
          round: latestRound + 1,
          game: game._id,
          players: _.map(game.players, 'player'),
        });
      });

      tournament = await tournament.save();

      return Promise.resolve({
        message: 'Next round created',
        type: 'next:round:created',
        data: {
          tournament: tournament,
          games: games,
        },
      });
    } else {
      return Promise.resolve({
        message: 'Tournament finished',
        type: 'tournament:finished',
        data: {
          tournament: tournament,
        },
      });
    }
  } else {
    return Promise.resolve({
      message: 'Current round not finished yet',
      type: 'round:not:finished',
      data: {
        tournament: tournament,
      },
    });
  }
}

function report(game) {
  game.players = createPlayerReports(game);
  game.players = createPlayerPositions(game);
  return game.save();
}

function createPlayerReports(game) {
  let opponentAmount = game.players.length - 1;
  let letterLimit = game.word.length;

  _.forEach(game.players, (player) => {
    player.report.xp = POINTS.XP.FOR_PLAYING;

    if (!player.report.l) {
      player.report.w = 1;
    }

    if (player.report.w) {
      player.report.xp += POINTS.XP.FOR_EACH_OPPONENT * opponentAmount;
    }

    if (player.report.lettersGiven) {
      player.report.xp += POINTS.XP.FOR_EACH_LETTER * player.report.lettersGiven;
    }
  });

  return game.players;
}

function createPlayerPositions(game) {
  let startPos = 1;

  game.players = _.orderBy(game.players, ['report.w', 'report.lostAtTurn'], ['asc', 'desc']);

  game.players.sort((a, b) => {
    if (a.report.w) {
      a.report.position = startPos;
      startPos++;
      b.report.position = startPos;
    }

    if (a.report.lostAtTurn > b.report.lostAtTurn) {
      a.report.position = startPos;
      startPos++;
      b.report.position = startPos;
    } else if (a.report.lostAtTurn == b.report.lostAtTurn) {
      a.report.position = startPos;
      b.report.position = startPos;
    }
  });

  return game.players;
}

function reward(game) {
  let promises = _.forEach(game.players, (player) => {
    return User.findById(player.player._id)
      .then((user) => {
        user.stats.xp += player.report.xp || 0;
        user.stats.w += player.report.w || 0;
        user.stats.l += player.report.l || 0;
        return user.save((err, user) => {
          return Promise.resolve();
        });
      })
      .catch((err) => {
        return Promise.resolve(err);
      });
  });

  return Promise.all(promises);
}

function deward(game) {
  let promises = _.forEach(game.players, (player) => {
    return User.findById(player.player._id)
      .then((user) => {
        user.user.stats.xp -= player.report.xp;
        user.user.stats.w -= player.report.w;
        user.user.stats.l -= player.report.l;
        return user.save((err, user) => {
          return Promise.resolve();
        });
      })
      .catch((err) => {
        return Promise.resolve(err);
      });
  });

  return Promise.all(promises);
}

function removePlayer(id, user) {
  return Game.findByIdAndUpdate(id, { $pull: { players: { _id: user } } }, { new: true })
    .populate('players.player', 'username')
    .populate('turns.player', 'username')
    .populate('turns.good', 'username')
    .populate('turns.fail', 'username')
    .deepPopulate('turns.trick.essential')
    .lean();
}

module.exports = {
  create,
  read,
  pass,
  referee,
  destroyTournamentGames,
};
