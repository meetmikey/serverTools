var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');
var LinkModel = mongoose.model ('Link');
var AttachmentModel = mongoose.model ('Attachment');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}


appInitUtils.initApp( 'findThreadAttDuplicates', initActions, conf, function() {
  var reported = {}
  var dupes = 0;
  var total = 0;
  // for each user
  UserModel.findById ("517072f3d76a885823000006", function (err, foundUser) {
    // for each promoted attachment
    AttachmentModel.find ({userId : foundUser._id})
      .limit (limit)
      .select ('gmThreadId hash')
      .exec (function (err, attachments) {
        if (err) {

        } else if (attachments && attachments.length) {
          attachments.forEach ( function (attachment)  {
            var hash = attachment.hash;
            var gmThreadId = attachment.gmThreadId;

            AttachmentModel.count ({userId : foundUser._id, gmThreadId : gmThreadId, hash : hash}, function (err, count) {
              if (count > 1 && !(gmThreadId + "_"  + hash in reported)) {
                winston.doInfo('info', {count: count, thread: gmThreadId, hash: hash});
                reported [gmThreadId + "_" + hash] = 1;
                dupes+=1
                total +=1
              } else {
                winston.doInfo('count', {count: count});
                total +=1
              }
            });
          });
        }
      })
    // see if there's a duplicate on the thread

    // if so delete the later sentDate
  });

setInterval (function () {
  var fraction = dupes/total;
  winston.doInfo('fraction', {fraction: fraction});
}, 5000)

});
