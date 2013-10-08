var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , userQueueUtils = require('../lib/userQueueUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , esConnect = require(serverCommon + '/lib/esConnect')
  , prompt = require('prompt')

conf.turnDebugModeOn();

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node resetUser.js <email>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'resetUser', initActions, conf, function() {

  var resetUser = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];

      prompt.start();
      var message = '\nThis will reset ALL data for user ' + userEmail + '.  Are you SURE?';
      winston.consoleLog( message );

      var resetPrompt = 'reset this user? (y/n)'
      prompt.get([resetPrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[resetPrompt] ) || ( result[resetPrompt] !== 'y' ) ) {
          winston.doInfo('Aborted!');
          callback();

        } else {
          deleteUserUtils.performUserDelete( userEmail, false, function( err ) {
            if ( err ) {
              callback( err );

            } else {
              userQueueUtils.addUserToDownloadQueue( userEmail, callback );
            }
          });
        }
      });
    }

    , finish: function(err) {
      if ( err ) {
        winston.handleError( err );
      }
      mongoose.disconnect();
      esConnect.stopPollingNodesAndHealth();
    }
  }

  //Do it.
  resetUser.run( resetUser.finish );
});