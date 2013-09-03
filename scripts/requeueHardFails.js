var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    utils = require (serverCommon + '/lib/utils'),
    https = require ('https'),
    _ = require ('underscore'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 100;
var offset = 1000*60*60*8; // 8 hours

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp( 'requeueHardFails', initActions, conf, function() {

  var cutoff = utils.objectIdWithTimestamp (Date.now() - 1000*60*60*5);

  MailModel.find ({_id : {$gte : cutoff}},
    function (err, foundMails) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
    } else if (foundMails) {

      var mailToQueue = _.filter (foundMails, function (mail) {
        return mail.mailReaderState == 'hardFail';
      });

      // update tries to 0 and state to started
      var mailIds = _.map (mailToQueue, function (mail) { return mail._id });

      MailModel.update ({_id : {$in : mailIds}}, 
        {$set : {tries : 0, mailReaderState : 'started'}},
        {multi : true},
        function (err, num) {
          if (err) {
            winston.doMongoError (err);
          } else if (num === 0) {
            winston.doWarn ('no records affected');
          } else {
            winston.doInfo ('num records updated', {num : num});
            winston.doInfo ('About to send messages to queue', {numMessages : mailToQueue.length});

            mailToQueue.forEach (function (mail) {
              var inAzure = true;
              sqsConnect.addMessageToMailReaderQueue ({'userId' : mail.userId, 'path' : mail.s3Path, 'mailId' : mail._id, 'inAzure' : inAzure});
            });

          }
        });
    }
  });

});
