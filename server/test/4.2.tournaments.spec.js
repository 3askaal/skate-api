const request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
const _ = require('lodash');
const faker = require('faker');
const mongoose = require('mongoose');

const CONFIG = require('../config');
const URL = `http://localhost:1337`;
let STORAGE = require('./0.storage.spec');

let delay = 200;

describe('Tournaments', function() {
  it('Create tournament', (done) => {
    let config = {};
    config.players = _.map(_.sampleSize(STORAGE.users, 15), '_id');
    config.players.push(STORAGE.users[0]._id);
    config.word = 'soty';

    chai
      .request(URL)
      .post('/tournament')
      .send(config)
      .then((response) => {
        STORAGE.tournament = response.body.data.tournament;
        STORAGE.games = response.body.data.games;
        done();
      })
      .catch((err) => {
        console.log('err', err);
      });
  });

  it('Finish first round tournament games with random tricks', (done) => {
    finishGames(done);
  });
});

function finishGames(done) {
  STORAGE.games.forEach(async (game, index) => {
    finishGame(game, index, done);
  });
}

async function finishGame(game, index, done) {
  const trick = _.sample(STORAGE.tricks);
  let randomInt = Math.round(Math.random());

  let turn = {
    player: game.players[randomInt].player,
    trick: trick._id,
    fail: [game.players[randomInt === 1 ? 0 : 1].player],
  };

  setTimeout(() => {
    chai
      .request(URL)
      .post(`/game/${game._id}/apply`)
      .send({ turn: turn })
      .then((response) => {
        const type = response.body.type;
        console.log('type: ', type);

        if (type === 'defense:applied') {
          finishGame(game, index, done);
        }

        if (type === 'round:not:finished') {
          return;
        }

        if (type === 'next:round:created') {
          STORAGE.games = response.body.data.games;
          finishGames(done);
        }

        if (type === 'tournament:finished') {
          done();
        }
      });
  }, delay * index);
}
