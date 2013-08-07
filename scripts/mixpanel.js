var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    esUtils = require (serverCommon + '/lib/esUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    Mixpanel = require('mixpanel'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init('4025d8a58a875ce9a39db05bcf86fd71');

//var mixpanel = Mixpanel.init('0d4029b8e19dddbfacd1da118b47c01b');

appInitUtils.initApp( 'mixpanelFill', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else if (foundUsers && foundUsers.length) {
      var len = foundUsers.length;
      var totalCallbacks = 0;

      foundUsers.forEach (function (user) {
        console.log ('user', user.email);
        // create or update a user in Mixpanel Engage
        mixpanel.people.set(user._id, {
          $first_name: user.firstName,
          $last_name: user.lastName,
          $email : user.email,
          $created: user.timestamp,
        });        
      });

    }

  });

});