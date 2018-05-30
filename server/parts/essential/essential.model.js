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
    name: { type: String, required: true },
    difficulty: { type: Number, required: true },
    boardDirection: { type: String },
  },
  {
    timestamps: true,
  },
);

const EssentialModel = mongoose.model('Essential', Schema);

module.exports = EssentialModel;
