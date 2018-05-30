'use strict';

const jwt = require('jsonwebtoken');
const BOOM = require('boom');
const CONFIG = require('../../config');
const User = require('./user.model');
const Push = require('../../communicate/push');

function requestMate(request, reply) {
  const userID = request.payload.user;
  const mateID = request.payload.mate;

  // request mate at user
  User.findOneAndUpdate(
    { _id: mateID, 'mates.mate': { $ne: userID } },
    { $push: { mates: { mate: userID, status: 1 } } },
  )
    .then((mate) => {
      // request mate at mate
      User.findOneAndUpdate(
        { _id: userID, 'mates.mate': { $ne: mateID } },
        { $push: { mates: { mate: mateID, status: 2 } } },
      )
        .then((user) => {
          reply({ user: user, mate: mate });
          // notify both
          // COMMENTED OUT FOR DEMO
          // Push(userID, mateID, "mate:request")
          //   .then(() => {
          //     reply({ user: user, mate: mate });
          //   })
          //   .catch(err => {
          //     reply(BOOM.badRequest(err));
          //   });
        })
        .catch((err) => {
          reply(BOOM.badRequest(err));
        });
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

function acceptMate(request, reply) {
  const userID = request.payload.user;
  const mateID = request.payload.mate;

  // accept mate at user
  User.findOneAndUpdate({ _id: userID, 'mates.mate': mateID }, { $set: { 'mates.$.status': 0 } })
    .then((user) => {
      // accept mate at mate
      User.findOneAndUpdate({ _id: mateID, 'mates.mate': userID }, { $set: { 'mates.$.status': 0 } })
        .then((mate) => {
          reply({ user: user, mate: mate });
          // notify both
          // COMMENTED OUT FOR DEMO
          // Push(userID, mateID, "mate:accept")
          //   .then(() => {
          //     reply({ user: user, mate: mate });
          //   })
          //   .catch(err => {
          //     reply(BOOM.badRequest(err));
          //   });
        })
        .catch((err) => {
          reply(BOOM.badRequest(err));
        });
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

function removeMate(request, reply) {
  const userID = request.payload.user;
  const mateID = request.payload.mate;

  // remove mate at user
  User.findByIdAndUpdate(userID, { $pull: { mates: { mate: mateID } } })
    .then((user) => {
      // remove mate at mate
      User.findByIdAndUpdate(mateID, { $pull: { mates: { mate: userID } } })
        .then((mate) => {
          reply({ user: user, mate: mate });
        })
        .catch((err) => {
          reply(BOOM.badRequest(err));
        });
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

const matesController = {
  requestMate,
  acceptMate,
  removeMate,
};

module.exports = matesController;
