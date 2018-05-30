'use strict';

const mongoose = require('mongoose');
const shortid = require('shortid');
const ObjectId = mongoose.Schema.ObjectId;
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const _ = require('lodash');

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    word: {
      type: String,
      default: 'skate',
    },
    players: [
      {
        player: { type: String, ref: 'User' },
        letters: { type: Number, default: 0 },
        report: {
          position: Number,
          w: Number,
          l: Number,
          xp: Number,
          lostAtTurn: Number,
          lettersGiven: { type: Number, default: 0 },
        },
        _id: false,
      },
    ],
    turns: [
      {
        player: { type: String, ref: 'User' },
        trick: { type: String, ref: 'Trick' },
        good: [{ type: String, ref: 'User' }],
        fail: [{ type: String, ref: 'User' }],
        _id: false,
      },
    ],
    current: { type: String, ref: 'User' },
    ref: { type: String, ref: 'User' },
    winner: { type: String, ref: 'User' },
    status: { type: String },
    tournament: { type: String, ref: 'Tournament' },
  },
  {
    versionKey: false,
    timestamps: true,
    usePushEach: true,
  },
);

Schema.plugin(deepPopulate, {
  populate: {
    'turns.trick.essential': {
      select: 'name',
    },
  },
});

const GameModel = mongoose.model('Game', Schema);

module.exports = GameModel;
