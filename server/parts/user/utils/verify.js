'use strict';

const BOOM = require('boom');
const bcrypt = require('bcryptjs');
const User = require('../user.model');

function unique(req, reply) {
  User.findOne({
    $or: [{ username: req.payload.username }, { email: req.payload.email }],
  })
    .then((user) => {
      if (user.username === req.payload.username) {
        reply(BOOM.badRequest('Username taken'));
      }

      if (user.email === req.payload.email) {
        reply(BOOM.badRequest('Email taken'));
      }
    })
    .catch((err) => {
      reply(req.payload);
    });
}

function credentials(req, reply) {
  User.findOne({
    $or: [{ username: req.payload.identifier }, { email: req.payload.identifier }],
  })
    .select('username email password')
    .then((user) => {
      bcrypt.compare(req.payload.password, user.password, (err, isValid) => {
        if (isValid) {
          reply(user);
        } else {
          reply(BOOM.badRequest('Incorrect password!'));
        }
      });
    })

    .catch((err) => {
      reply(BOOM.badRequest('Incorrect username or email!'));
    });
}

module.exports = {
  unique,
  credentials,
};
