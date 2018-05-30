'use strict';

const _ = require('lodash');
const gcm = new require('node-gcm');

// Models
const User = require('../parts/user/user.model');

// Config
const CONFIG = require('../config');

// Init
const push = new gcm.Sender(CONFIG.push.gcm.key);

// Messages
const MESSAGES = require('./messages').PUSH;

function Push(sender, users, type) {
  return User.find({ _id: sender }).then((sender) => {
    let msg = _.extend({}, MESSAGES[type]);

    msg.notification.body = msg.notification.body.replace('{{sender}}', sender[0].username);

    if (msg.data) {
      if (msg.data.lobby) {
        msg.data.lobby = sender[0]._id;
      }
    }

    return User.find({ _id: { $in: users } }).then((users) => {
      let devices = _.compact(_.map(users, 'device'));

      return push.send(new gcm.Message(msg), { registrationTokens: devices }, function(err, res) {
        if (err) {
          return Promise.reject(err);
        } else {
          return Promise.resolve(res);
        }
      });
    });
  });
}

module.exports = Push;
