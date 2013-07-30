var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
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
          var userId = user._id;
          exports.getMinMailDate (userId, function (err, minDate) {
            if (err) {
              userCallback (err);
            } else {
              user.lastResumeJobEndDate = minDate;
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


exports.getMinMailDate = function (userId, callback) {
  async.parallel ([
    function (cb) {
      MailModel.findOne ({userId : userId, mmDone : true})
        .sort ('gmDate')
        .exec (function (err, minMail) {
          if (err) { 
            cb (winston.makeMongoError (err)); 
          } else if (!minMail) {
            cb (null, new Date(Date.now()));
          } else {
            cb (null, minMail.gmDate);
          }
        });
    },
    function (cb) {
      MailModel.findOne ({userId : userId, mmDone : {$exists : false}})
        .sort ('gmDate')
        .exec (function (err, minMail) {
          if (err) { 
            cb (winston.makeMongoError (err)); 
          } else if (!minMail) {
            cb (null, new Date(Date.now()));
          } else {
            cb (null, minMail.gmDate);
          }
        });
    }
  ],
  function (err, results) {
    if (err) {
      callback (err);
    } else {
      var min = Math.min (results[0], results[1]);
      callback (null, min);
    }
  });
}