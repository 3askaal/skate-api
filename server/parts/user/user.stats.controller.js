'use strict';

const jwt = require('jsonwebtoken');
const CONFIG = require('../../config');
const User = require('./user.model');

function getPosition(request, reply) {
  const id = request.params.id;
  const field = request.params.field.split('.')[1];

  User.findById(id)
    .select('stats updatedAt')
    .then((user) => {
      User.where('_id')
        .ne(id)
        .where('stats.' + field)
        .gte(user.stats[field])
        .count()
        .then((position) => {
          reply(position);
        });
    });
}

const StatsController = {
  getPosition,
};

module.exports = StatsController;
