var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    _ = require ('underscore'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

conf.turnDebugModeOn();

var limit = 100;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp( 'mailRecoveryByUser', initActions, conf, function() {

  //db.mails.count ({_id : {$gt : ObjectId("51eb157a35269ba75319570b"), $lt : ObjectId("51ec1c63eb3ed3360b12c11b")}})
//  UserModel.find ({timestamp : {$gte : "2013-07-20T23:00:00.780Z", $lte : "2013-07-21T16:21:25.860Z"}}, function (err, users) {


  UserModel.find ({}, null, {limit : 1}, function (err, users) {
      if (err) {
        winston.doMongoError (err);
      } else {

        async.forEachSeries (users, function (user, userCallback) {
          winston.doInfo ('starting user', {user : user.email});

          MailModel.find ({userId : user._id, mmDone : true, gmDate : {$gte : '2013-07-20T23:00:00.780Z'}}, function (err, mails) {
            winston.doInfo ('mail len', {len : mails.length});

            var mailToRequeue = _.filter (mails, function (mail) {
              return mail.mmDone && mail.linkExtractorState == 'ignored';
            });

            console.log ('requeue len', mailToRequeue.length)

            if (mailToRequeue.length) {
              winston.doInfo ('mailToRequeue', {len : mailToRequeue.length});

              var ids = _.pluck (mailToRequeue, '_id');

              MailModel.update ({_id : {$in : ids}}, {$set : {mailReaderState : 'started', tries : 0}}, {multi : true}, function (err, num) {
                if (err) {
                  userCallback (winston.makeMongoError (err));
                } else if (num == 0) {
                  userCallback (winston.makeError ('nothing affected'));
                } else {

                  winston.doInfo ('models updated, about to requeue', {num : num});
                  console.log ('sample', ids[0]);


                  async.forEach (mailToRequeue, function (mail, rqCallback) {

                    var message = {'userId' : mail.userId, 'path' : mail.s3Path, 'mailId' : mail._id, 'inAzure' : true};
                    sqsConnect.addMessageToMailReaderQueue (message , function (err) {
                      if (err) {
                        rqCallback (err);
                      } else {
                        rqCallback();
                      }
                    });

                  }, function (err) {
                    winston.doInfo ('all requeued');
                    userCallback (err);
                  });

                }
              });

            } else {
            winston.doInfo ('no mail to requeue', {len : mailToRequeue.length});
            userCallback();
          }

        });
      }, function (err) {
        if (err) {
          winston.handleError (err);
        } else {
          winston.doInfo ('all done for all users');
        }
      });
    }
  });

});