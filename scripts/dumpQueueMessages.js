var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    fs = require ('fs'),
    conf = require (serverCommon + '/conf');


var messages = []

sqsConnect.pollWorkerQueue (function (message, pollQueueCallback) {
  messages.push (message)
  fs.writeFile ('oldQueueMessages', messages)
  pollQueueCallback ()
}, 109);