'use strict';

const BOOM = require('boom');
const _ = require('lodash');
const qs = require('qs');

const models = {
  essential: require('../parts/essential/essential.model'),
  game: require('../parts/game/game.model'),
  tournament: require('../parts/tournament/tournament.model'),
  tag: require('../parts/tag/tag.model'),
  trick: require('../parts/trick/trick.model'),
  user: require('../parts/user/user.model'),
};

// [C]REATE
//////////////////

function create(request, reply) {
  const col = request.params.col;
  const data = request.payload;

  models[col]
    .create(data)
    .then((items) => {
      reply(items);
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

// [R]EAD
//////////////////

function read(request, reply) {
  const query = qs.parse(request.query);

  if (request.params.id) {
    query.find = { _id: request.params.id };
  }

  models[request.params.col]
    .find(query.find || {})
    .sort(query.sort || '-updatedAt')
    .select(query.sel || '')
    .populate(query.pop || '', query.popsel || '')
    .skip(+query.skip || '')
    .limit(+query.limit || 100)
    .then((items) => {
      reply(items);
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

// [U]PDATE
//////////////////

function update(request, reply) {
  const col = request.params.col;
  const id = request.params.id;
  const data = request.payload;

  models[col]
    .findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
    .then((item) => {
      reply(item);
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

// [D]ESTROY
//////////////////

function destroy(request, reply) {
  const col = request.params.col;
  const id = request.params.id || {};

  models[col]
    .find(id)
    .remove()
    .then(() => {
      reply();
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

module.exports = {
  create,
  read,
  update,
  destroy,
};
