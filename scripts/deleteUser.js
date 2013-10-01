var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

conf.turnDebugModeOn();

if ((! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node deleteUser.js <email> <also delete user object (true/false)>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'deletUser', initActions, conf, function() {

  var deleteUser = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];
      var shouldDeleteUserObject = false;
      if ( ( process.argv.length >= 4 ) && ( process.argv[3] == 'true' ) ) {
        shouldDeleteUserObject = true;
      }

      prompt.start();
      var message = '\nThis will delete EVERYTHING about user ' + userEmail;
      if ( shouldDeleteUserObject ) {
        message += ', including the user itself';
      } else {
        message += ', except the user itself';
      }
      message += '.  Are you SURE?';
      winston.consoleLog( message );

      var deletePrompt = 'delete this user? (y/n)'
      prompt.get([deletePrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[deletePrompt] ) || ( result[deletePrompt] !== 'y' ) ) {
          winston.doInfo('Aborted!');
          callback();

        } else {
          winston.doInfo('running...', {userEmail: userEmail, shouldDeleteUserObject: shouldDeleteUserObject});
          deleteUserUtils.performUserDelete( userEmail, shouldDeleteUserObject, callback );
        }
      });
    }

    , finish: function( err ) {
      if ( err ) {
        winston.handleError( err );
      } else {
        winston.doInfo('All done!');
      }
      mongoose.disconnect();
    }
  }

  //Do it.
  deleteUser.run( deleteUser.finish );
});