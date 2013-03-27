var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'requeueMessages', initActions, conf, function() {

  MailModel.find ({s3Path : {$exists : true}, 
    $or : [ {mailReaderState : {$exists : false}}, {mailReaderState : 'softFail'}, {mailReaderState : 'hardFail'} ] },
    's3Path _id userId uid',
    function (err, foundMails) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
    }
    else if (foundMails) {


      winston.doInfo ('About to send messages to queue', {numMessages : foundMails.length});

      foundMails.forEach (function (mail) {
        var inAzure = true;
        sqsConnect.addMessageToMailReaderQueue ({'userId' : mail.userId, 'path' : mail.s3Path, 'mailId' : mail._id, 'inAzure' : inAzure});

        console.log (https.globalAgent.sockets['sqs.us-east-1.amazonaws.com:443'].length)
        console.log ('sockets', Object.keys(https.globalAgent.sockets).length);
        console.log ('requests', Object.keys(https.globalAgent.requests).length);


      });
    }
  });

});