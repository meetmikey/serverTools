var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

conf.turnDebugModeOn()

if ((! process ) || ( ! process.argv ) || ( process.argv.length < 2 ) ) {
  winston.doWarn('Missing params: usage: node deletUserDataByUserId.js <userId>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'deletUserDataByUserId', initActions, conf, function() {

  var deletUserDataByUserId = {
    
    run: function( callback ) {

      var userId = process.argv[2];

      prompt.start();
      var message = '\nThis will delete all the user data for userId ' + userId + '.  Are you SURE?';
      winston.consoleLog( message );

      var deletePrompt = 'delete this user data? (y/n)'
      prompt.get([deletePrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[deletePrompt] ) || ( result[deletePrompt] !== 'y' ) ) {
          winston.doInfo('Aborted!');
          callback();

        } else {
          winston.doInfo('running...', {userId: userId});
          deleteUserUtils.performUserDataDeleteByUserId( userId, callback );
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
  deletUserDataByUserId.run( deletUserDataByUserId.finish );
});