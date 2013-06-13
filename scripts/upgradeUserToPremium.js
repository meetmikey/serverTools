var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , userQueueUtils = require('../lib/userQueueUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node resetUser.js <email>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'upgradeUser', initActions, conf, function() {

  var upgradeUser = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];

      prompt.start();
      var message = 'This will upgrade the user: ' + userEmail + ' to premium.';
      console.log();
      console.log( message );

      var resetPrompt = 'upgrade this user? (y/n)'
      prompt.get([resetPrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[resetPrompt] ) || ( result[resetPrompt] !== 'y' ) ) {
          console.log('Aborted!');
          callback();

        } else {
          userQueueUtils.upgradeUser (userEmail, callback);
        }
      });
    }

    , finish: function(err) {
      if ( err ) {
        winston.handleError( err );
      }
      console.log ('finished');
      mongoose.disconnect();
    }
  }

  //Do it.
  upgradeUser.run( upgradeUser.finish );
});