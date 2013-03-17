var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserData = require('../lib/deleteUserData')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
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
      var deleteUserObject = false;
      if ( ( process.argv.length >= 4 ) && ( process.argv[3] == 'true' ) ) {
        deleteUserObject = true;
      }

      prompt.start();
      var message = 'This will delete EVERYTHING about this user';
      if ( deleteUserObject ) {
        message += ', including the user itself';
      }
      message += '.  Are you SURE?';
      console.log();
      console.log( message );

      var deletePrompt = 'delete this user? (y/n)'
      prompt.get([deletePrompt], function (err, result) {
        if ( err ) {
          winston.doError('prompt error', {promptError: err});
          deleteUser.finish();

        } else if ( ( ! result ) || ( ! result[deletePrompt] ) || ( result[deletePrompt] !== 'y' ) ) {
          console.log('Aborted!');
          deleteUser.finish();

        } else {
          deleteUserData.performUserDelete( userEmail, deleteUserObject, deleteUser.finish );
        }
      });
    }

    , finish: function() {
      mongoose.disconnect();
    }
  }

  //Do it.
  deleteUser.run();
});