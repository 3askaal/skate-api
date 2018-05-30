"use strict";

let server = require("./server/index");

server.start(err => {
  if (err) {
    throw err;
  }

  console.log("info", "Server Running At: " + server.info.uri);
});
