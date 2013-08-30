var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    fs = require ('fs'),
    conf = require (serverCommon + '/conf');


var queueName = process.argv[2];
var numWorkers = 20;

if (!queueName) {
  winston.doError ("must specify queue which you wish to clear");
  process.exit(1);
}

queueName = queueName.toLowerCase();

var pollFunction;

if (queueName == 'worker') {
  pollFunction = sqsConnect.pollWorkerQueue;
} else if (queueName == 'workerquick') {
  pollFunction = sqsConnect.pollWorkerQuickQueue;
} else if (queueName == 'thumbnail') {
  pollFunction = sqsConnect.pollThumbnailQueue;
} else if (queueName == 'thumbnailquick') {
  pollFunction = sqsConnect.pollThumbnailQuickQueue;
} else if (queueName == 'mailreader') {
  pollFunction = sqsConnect.pollMailReaderQueue;
} else if (queueName == 'mailreaderquick') {
  pollFunction = sqsConnect.pollMailReaderQuickQueue;
} else if (queueName == 'maildownload') {
  pollFunction = sqsConnect.pollMailDownloadQueue;
} else if (queueName == 'thumbnail') {
  pollFunction = sqsConnect.pollThumbnailQueue;
} else {
  winston.doError ('invalid queue name');
  process.exit(1);
}

pollFunction (function (message, pollQueueCallback) {
  pollQueueCallback ()
}, numWorkers);
