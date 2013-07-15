var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , extraDaysUtils = require('../lib/extraDaysUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

conf.turnDebugModeOn()

if ((! process ) || ( ! process.argv ) || ( process.argv.length < 5 ) ) {
  winston.doWarn('Missing params: usage: node grantExtraDays.js <user email> <num extra days> <your last name>');
  process.exit(1);
}

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'grantExtraDays', initActions, conf, function() {

  var grantExtraDays = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];
      var numExtraDays = process.argv[3];
      var grantorLastName = process.argv[4];

      prompt.start();
      var message = '\nThis will add ' + numExtraDays + ' days to ' + userEmail + '\'s account.  Are you sure?';
      winston.consoleLog( message );

      var grantPrompt = '(y/n)';
      prompt.get([grantPrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[grantPrompt] ) || ( result[grantPrompt] !== 'y' ) ) {
          winston.doInfo('Aborted!');
          callback();

        } else {
          extraDaysUtils.grantExtraDays( userEmail, numExtraDays, grantorLastName, callback );
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
  grantExtraDays.run( grantExtraDays.finish );
});