'use strict';

const BOOM = require('boom');
const Essential = require('./essential.model');
const TrickController = require('../trick/trick.controller');

function create(request, reply) {
  const payload = request.payload;

  const tricks = [];

  Essential.create(payload)
    .then(async (essentials) => {
      if (essentials.length) {
        essentials.forEach(async function(essential) {
          const essentialTricks = await TrickController.createCombos(essential);
          tricks.push(essentialTricks);
        });
      } else {
        const essentialTricks = await TrickController.createCombos(essentials);
        tricks.push(essentialTricks);
      }

      reply({ essentials: essentials, tricks: tricks });
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

function destroy(request, reply) {
  const id = request.params.id;

  Essential.find(id)
    .remove()
    .then(() => {
      TrickController.removeCombos(id);
      reply();
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

module.exports = {
  create,
  destroy,
};
