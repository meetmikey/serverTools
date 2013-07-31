var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
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

appInitUtils.initApp( 'updateUserJulyMigration', initActions, conf, function() {

  UserModel.find ({}, function (err, users) {
      if (err) {
        winston.doMongoError (err);
      } else {

        async.forEachSeries (users, function (user, userCallback) {
          winston.doInfo ('starting user', {user : user.email});

          MailModel.findOne ({userId : user._id, mmDone : true})
            .sort ('gmDate')
            .exec (function (err, mail) {
              if (err) {
                userCallback (winston.makeMongoError (err));
              } else {

                user.lastResumeJobEndDate = mail.gmDate;

                if (user.isPremium) {
                  user.isGrantedPremium = true;
                }

                user.billingPlan = 'free';

                user.save (function (err) {
                  if (err) {
                    userCallback (winston.makeMongoError (err));
                  } else {
                    userCallback();
                  }
                });
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
  })
});