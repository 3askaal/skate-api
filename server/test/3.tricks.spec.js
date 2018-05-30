const request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
const _ = require('lodash');
const faker = require('faker');
const mongoose = require('mongoose');

const CONFIG = require('../config');
const URL = `http://localhost:1337`;
let STORAGE = require('./0.storage.spec');

describe('Tricks', function() {
  it('Create essentials and trick combinations', (done) => {
    const essentials = [
      { name: 'ollie', difficulty: 1 },
      { name: 'pop shove-it', difficulty: 2, boardDirection: 'bs' },
      { name: 'front shove-it', difficulty: 2, boardDirection: 'fs' },
      { name: 'kickflip', difficulty: 3 },
      { name: 'heelflip', difficulty: 3 },
      { name: '360 flip', difficulty: 5, boardDirection: 'bs' },
      { name: 'laser flip', difficulty: 5, boardDirection: 'fs' },
    ];

    const promise = chai
      .request(URL)
      .post('/essential')
      .send(essentials)
      .then((res) => {
        const promise = chai
          .request(URL)
          .get('/trick')
          .then((res) => {
            STORAGE.tricks = res.body;
            done();
          })
          .catch((err) => {
            console.log('err', err);
          });
      })
      .catch((err) => {
        console.log('err', err);
      });
  });
});
