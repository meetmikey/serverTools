var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var UserModel = mongoose.model ('User');
var MailModel = mongoose.model ('Mail');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

conf.turnDebugModeOn()

appInitUtils.initApp( 'userShortId', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else if (foundUsers && foundUsers.length) {
      var len = foundUsers.length;
      var totalCallbacks = 0;

      async.eachSeries (foundUsers, function (user, cb) {
        user.save (function (err) {
          cb (err);
        })

      }, function (err) {
        console.log (err);
        winston.doInfo('all done');
      });
    }
  });

});