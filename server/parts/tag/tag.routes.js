'use strict';

const TagController = require('./tag.controller');

exports.register = (server, options, next) => {
  server.route([]);

  next();
};

exports.register.attributes = {
  name: 'tag-route',
  version: '1.0.0',
};
