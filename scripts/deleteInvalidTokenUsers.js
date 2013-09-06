var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , UserModel = require (serverCommon + '/schema/user').UserModel
  , Mixpanel = require('mixpanel')
  , async = require ('async')
  , prompt = require('prompt')

conf.turnDebugModeOn()

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'deleteInvalidTokenUsers', initActions, conf, function() {

  var deleteUser = {
    
    run: function( callback ) {

      var mixpanel = Mixpanel.init('4025d8a58a875ce9a39db05bcf86fd71');
      prompt.start();
      var message = '\nThis will delete all users with invalid tokens.';
      message += '.  Are you SURE?';
      winston.consoleLog( message );

      var deletePrompt = 'start script? (y/n)'
      prompt.get([deletePrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[deletePrompt] ) || ( result[deletePrompt] !== 'y' ) ) {
          winston.doInfo('Aborted!');
          callback();

        } else {
          UserModel.find ({invalidToken : true}, '_id email lastLogin isGrantedPremium isPremium billingPlan', {limit : 10}, function (err, usersToDelete) {
            if (err) {
              winston.doMongoError (err);
            } else {
              winston.doInfo ('deleting users',  {length : usersToDelete.length});
              async.eachSeries (usersToDelete, 
                function (user, cb) {
                  
                  if (user.lastLogin || user.billingPlan) {
                    cb();
                    winston.doInfo ('not deleting user', {email : user.email});
                    return;
                  }

                  winston.doInfo ('about to delete user', {email : user.email});
                  deleteUserUtils.performUserDelete( user.email, true, function (err) {
                    if (err) {
                      cb(winston.makeError ('could not perform user delete', {err : err}));
                      return;
                    }

                    //deregister from mp
                    mixpanel.people.delete_user (user._id, function (err) {
                      if (err) {
                        cb (winston.makeError ('could not delete from mixpanel', {err : err}));
                      } else {
                        cb ();
                      }
                    });
                  });
                },
                function (err) {
                  callback (err);
                });
            }
          });
        }
      });
    }

    , finish: function( err ) {
      if ( err ) {
        winston.handleError( err );
      }
      mongoose.disconnect();
    }
  }

  //Do it.
  deleteUser.run( deleteUser.finish );
});