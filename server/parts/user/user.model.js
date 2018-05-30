'use strict';

const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true, select: false },
    password: { type: String, required: true, select: false },
    mates: [
      {
        mate: { type: String, ref: 'User' },
        status: Number,
        _id: false,
      },
    ],
    stats: {
      xp: { type: Number, default: 0 },
      w: { type: Number, default: 0 },
      l: { type: Number, default: 0 },
    },
    device: String,
    admin: Boolean,
  },
  {
    timestamps: true,
  },
  { usePushEach: true },
);

const UserModel = mongoose.model('User', Schema);

module.exports = UserModel;
