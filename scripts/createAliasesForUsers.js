var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    esUtils = require (serverCommon + '/lib/esUtils'),
    conf = require (serverCommon + '/conf'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var UserModel = mongoose.model ('User');
var AttachmentModel = mongoose.model ('AttachmentModel');
var LinkModel = mongoose.model ('LinkModel');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'createAliasesForUsers', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else if (foundUser && foundUsers.length) {
      var len = foundUsers.length;
      var totalCallbacks = 0;

      foundUsers.forEach (function (user) {
        esUtils.createAliasForUser (user._id, function (err) {
          totalCallbacks++;
          if (err) {
            winston.handleError (err);
          } else if (totalCallbacks == len) {
            winston.doInfo ('all done for all users');
          }
        });
      });
    }
  });

});