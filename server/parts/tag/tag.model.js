'use strict';

const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    name: { type: String, unique: true, required: true },
    main: Boolean,
  },
  {
    timestamps: true,
  },
  { usePushEach: true },
);

const TagModel = mongoose.model('Tag', Schema);

module.exports = TagModel;
