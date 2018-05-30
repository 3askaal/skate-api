'use strict';

const BOOM = require('boom');
const Trick = require('./trick.model');
const Essential = require('../essential/essential.model');
const CONSTANTS = require('../../constants/tricks');

function read() {
  return Trick.find().populate('essential', 'name');
}

function createCombos(essential) {
  const tricks = [];

  const positions = CONSTANTS.TRICK.POSITIONS;
  const rotations = CONSTANTS.TRICK.ROTATIONS;
  const directions = CONSTANTS.TRICK.DIRECTIONS;

  positions.forEach(function(position) {
    rotations.forEach(function(rotation) {
      if (rotation) {
        directions.forEach(function(direction) {
          const trick = createTrickDoc(essential, position, rotation, direction);
          tricks.push(trick);
        });
      } else {
        const trick = createTrickDoc(essential, position);
        tricks.push(trick);
      }
    });
  });

  return Trick.create(tricks);
}

function createTrickDoc(essential, position, rotation, direction) {
  let trick = {};

  trick.essential = essential._id;
  trick.position = position;

  if (rotation) {
    trick.rotation = rotation;
    trick.direction = direction;
  }

  if (essential.boardDirection && essential.boardDirection !== direction) {
    trick.twisted = true;
  }

  trick.difficulty = modifyDifficulty(trick, essential.difficulty);

  return trick;
}

function modifyDifficulty(trick, difficulty) {
  if (trick.position === 'n' || trick.position === 's') {
    difficulty++;
  }
  if (trick.rotation === 180) {
    difficulty += 1;
  }
  if (trick.rotation === 360) {
    difficulty += 2;
  }
  if (trick.rotation === 540) {
    difficulty += 3;
  }
  if (trick.rotation === 720) {
    difficulty += 4;
  }
  if (trick.twisted) {
    difficulty += 2;
  }

  return difficulty;
}

function destroyCombos(essential) {
  Trick.find({ essential: essential })
    .remove()
    .then((trick) => {
      reply({ message: 'Tricks removed' });
    })
    .catch((err) => {
      reply(BOOM.badRequest(err));
    });
}

module.exports = {
  read,
  destroyCombos,
  createCombos,
};
