'use strict';

const bcrypt = require('bcryptjs');
const CONFIG = require('../../../config');

function hash(password, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      return cb(err, hash);
    });
  });
}

module.exports = hash;
