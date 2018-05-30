'use strict';

const CONFIG = require('../../config');
const User = require('./user.model');

const hash = require('./utils/hash');
const createToken = require('./utils/token');

// REGISTER

function register(request, reply) {
  let user = request.payload;

  hash(user.password, (err, hash) => {
    if (err) {
      throw Boom.badRequest(err);
    }

    user.password = hash;

    User.create(user).then((user) => {
      const token = createToken(user);

      reply({ token: token, success: true, user: user }).code(201);
    });
  });
}

// LOGIN

function logIn(request, reply) {
  const user = request.pre.user;
  const token = createToken(user);

  reply({ user: user, token: token, success: true }).code(201);
}

// EMAIL PASSWORD

function forgotPassword(request, reply) {
  const user = request.pre.user;
}

// CHANGE PASSWORD

function changePassword(request, reply) {
  const user = request.pre.user;
  const newPassword = request.payload.new_password;

  hash(newPassword, (err, hash) => {
    if (err) {
      throw Boom.badRequest(err);
    }

    User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } }).then((user) => {
      reply({ user: user, success: true }).code(201);
    });
  });
}

// RESET STATS

function resetStats(request, reply) {
  const user = request.pre.user;

  User.findByIdAndUpdate(user._id, {
    $inc: {
      'stats.xp': 0,
      'stats.w': 0,
      'stats.l': 0,
    },
  })
    .then((user) => {
      reply({ user: user, success: true }).code(201);
    })
    .catch((err) => {
      BOOM.badRequest(err);
    });
}

module.exports = {
  register,
  logIn,
  forgotPassword,
  changePassword,
  resetStats,
};
