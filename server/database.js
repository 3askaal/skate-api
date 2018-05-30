'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const CONFIG = require('./config');

mongoose.Promise = Promise;

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://' + CONFIG.mongo.host + ':' + CONFIG.mongo.port + '/' + CONFIG.mongo.database,
);

mongoose.connection.on('connected', onDatabaseConnection);
mongoose.connection.on('disconnected', onDatabaseDisconnection);
mongoose.connection.on('error', onDatabaseError);

module.exports = mongoose.connection;

function onDatabaseConnection() {
  console.log('Database connection is open!');
}

function onDatabaseDisconnection() {
  console.log('Database connection is lost');
}

function onDatabaseError(err) {
  console.log('Database connection has an error: ' + err);
}
