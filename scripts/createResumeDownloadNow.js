var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , userQueueUtils = require('../lib/userQueueUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node addUserToResumeDownload.js <email>');
  process.exit(1);
}

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'addUserToResumeDownload', initActions, conf, function() {

  var addUserToResumeDownload = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];

      prompt.start();
      var message = 'This will add this user to the resume download table for right now.  Are you SURE?';
      console.log();
      console.log( message );

      var addUserPrompt = 'add this user to the resume table? (y/n)'
      prompt.get([addUserPrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[addUserPrompt] ) || ( result[addUserPrompt] !== 'y' ) ) {
          console.log('Aborted!');
          callback();

        } else {
          userQueueUtils.addUserToResumeTable( userEmail, callback );
        }
      });
    }

    , finish: function(err) {
      if ( err ) {
        winston.handleError( err );
      }
      mongoose.disconnect();
    }
  }

  //Do it.
  addUserToResumeDownload.run( addUserToResumeDownload.finish );
});