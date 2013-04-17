var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');
var LinkModel = mongoose.model ('Link');
var AttachmentModel = mongoose.model ('Attachment')

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 100;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  console.log ('limit', limit);
}

appInitUtils.initApp( 'expungeDrafts', initActions, conf, function() {

  MailModel.find ({mmDone : true, gmLabels : '\\\\Draft'}, 
    '_id userId uid gmLabels',
    {limit : limit},
    function (err, foundMails) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
    }
    else if (foundMails) {

      winston.doInfo ('About to delete links attachments corresponding to drafts mails ', {numMessages : foundMails.length});

      foundMails.forEach (function (mail) {
        console.log (mail);
        LinkModel.count ({mailId : mail._id}, function (err, count) {
          console.log ('links from draft' + mail._id, count);
        });
        /*
        // delete links, attachments, that originated from the draft
        LinkModel.remove ({mailId : mail._id}, function (err) {
          if (err) {
            winston.doMongoError (err);
          }
        });

        AttachmentModel.remove ({mailId : mail._id}, function (err) {
          if (err) {
            winston.doMongoError (err);
          }
        });
        */
      });
    }
  });

});