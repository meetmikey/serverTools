var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    esUtils = require (serverCommon + '/lib/esUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO,
  appInitUtils.CONNECT_ELASTIC_SEARCH
];

appInitUtils.initApp( 'createAliasesForUsers', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else if (foundUsers && foundUsers.length) {
      var len = foundUsers.length;
      var totalCallbacks = 0;

      async.eachSeries (foundUsers, function (user, cb) {
        esUtils.createAliasForUser (user._id, function (err) {
          winston.doInfo('creating alias for user', {user: user});
          if (err) {
            winston.handleError (err);
          }
          cb ();
        });
      }, function (err) {
        if (err) {
          winston.handleError (err);
        }
        winston.doInfo('all done');
      });
    }
  });

});