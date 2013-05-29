var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var QueuFailModel = mongoose.model ('QueueFail');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 100;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp( 'queueFails', initActions, conf, function() {

  QueuFailModel.find ({},
    function (err, foundFails) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
    }
    else if (foundFails) {

      winston.doInfo ('About to send messages to queue', {numMessages : foundFails.length});

      foundFails.forEach (function (fail) {

        var job = JSON.parse (fail.body);
        var queue = fail.queueName;

        if (queue == 'Worker' || queue == 'WorkerReindex') {
          sqsConnect.addMessageToWorkerQueue (job, function (err) {
            if (err) {
              winston.handleError(err);
            }
            winston.doInfo('job', {job: job});
          })
        }

      });
    }
  });

});