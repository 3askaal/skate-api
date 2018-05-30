const request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
const _ = require('lodash');
const faker = require('faker');
const mongoose = require('mongoose');

const CONFIG = require('../config');
const URL = `http://localhost:1337`;
let STORAGE = require('./0.storage.spec');

chai.use(chaiHttp);

describe('Users', function() {
  it('Create users', (done) => {
    let promises = [];

    for (var i = 0; i < 187; i++) {
      let payload;

      if (!i) {
        payload = {
          username: 'demo',
          email: 'demo@getskate.com',
          password: 'demo',
        };
      } else {
        payload = {
          username: faker
            .fake('{{internet.userName}}')
            .replace(/[^\w\s]/gi, '')
            .toLowerCase()
            .substring(0, 12),
          email: faker.internet.email(),
          password: 'password',
        };
      }

      const promise = chai
        .request(URL)
        .post('/user/register')
        .send(payload);

      promises.push(promise);
    }

    Promise.all(promises)
      .then((responses) => {
        STORAGE.users = _.map(responses, 'body.user');
        STORAGE.admin = _.find(STORAGE.users, { username: 'demo' });
        done();
      })
      .catch((err) => {
        console.log('err', err);
      });
  });
});
