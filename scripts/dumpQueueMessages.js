var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    fs = require ('fs'),
    conf = require (serverCommon + '/conf');


sqsConnect.pollMailReaderQueue (function (message, pollQueueCallback) {
  pollQueueCallback ()
}, 80);
