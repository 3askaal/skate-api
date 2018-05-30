const request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
const _ = require('lodash');
const faker = require('faker');
const mongoose = require('mongoose');

const CONFIG = require('../config');
const URL = `http://localhost:1337`;
let STORAGE = require('./0.storage.spec');

describe('Mates', function() {
  it('Request mates', (done) => {
    const promises = [];

    const mates = _.sampleSize(STORAGE.users, 12);

    console.log(mates);

    mates.forEach((mate) => {
      const promise = chai
        .request(URL)
        .put('/user/mates/request')
        .send({
          user: STORAGE.admin._id,
          mate: mate._id,
        });

      promises.push(promise);
    });

    Promise.all(promises)
      .then((responses) => {
        STORAGE.requestedMates = _.map(responses, 'body.mate');
        done();
      })
      .catch((err) => {
        console.log('err', err);
      });
  });

  it('Accept mates', (done) => {
    const promises = [];

    const matesToAccept = _.sampleSize(STORAGE.requestedMates, 8);

    matesToAccept.forEach((requestedMate) => {
      const promise = chai
        .request(URL)
        .put('/user/mates/accept')
        .send({
          user: requestedMate._id,
          mate: STORAGE.admin._id,
        });

      promises.push(promise);
    });

    Promise.all(promises)
      .then((responses) => {
        done();
      })
      .catch((err) => {
        console.log('err', err);
      });
  });
});
