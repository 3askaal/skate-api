'use strict';

const mongoose = require('mongoose');
const shortid = require('shortid');
const ObjectId = mongoose.Schema.ObjectId;

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    position: { type: String, default: 'r' },
    essential: { type: String, ref: 'Essential' },
    rotation: Number,
    direction: String,
    tags: [{ type: String, ref: 'Tag' }],
    difficulty: Number,
    twisted: Boolean,
  },
  {
    timestamps: true,
  },
);

Schema.statics.random = function(difficulty) {
  return this.find({ difficulty: { $lte: difficulty } })
    .count()
    .then((amount) => {
      let random = Math.floor(Math.random() * amount);

      return this.findOne({ difficulty: { $lte: difficulty } })
        .skip(random)
        .populate('essential');
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
};

const TrickModel = mongoose.model('Trick', Schema);

module.exports = TrickModel;
