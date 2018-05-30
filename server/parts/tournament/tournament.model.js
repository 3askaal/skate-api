'use strict';

const mongoose = require('mongoose');
const shortid = require('shortid');
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    name: {
      type: String,
      default: 'Tournament',
    },
    word: {
      type: String,
      default: 'skate',
    },
    players: [{ type: String, ref: 'User' }],
    bracket: [
      {
        round: Number,
        game: { type: String, ref: 'Game' },
        players: [{ type: String, ref: 'User' }],
        winner: { type: String, ref: 'User' },
        _id: false,
      },
    ],
    winner: { type: String, ref: 'User' },
  },
  {
    timestamps: true,
    usePushEach: true,
  },
);

Schema.plugin(deepPopulate, {
  populate: {
    'bracket.game.players.player': {
      select: 'username',
    },
  },
});

const TournamentModel = mongoose.model('Tournament', Schema);

module.exports = TournamentModel;
