var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , grantUserUtils = require('../lib/grantUserUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')
  , serverCommonConstants = require(serverCommon + '/constants')

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node resetUser.js <email>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'grantUserFacebookLike', initActions, conf, function() {

  var grantUserFacebookLike = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];

      prompt.start();
      var message = '\nThis will grant user ' + userEmail + ' credit for a facebook like. Are you sure?';
      console.log( message );

      var grantPrompt = '(y/n)';
      prompt.get([grantPrompt], function (err, result) {
        if ( err ) {
          callback( winston.makeError('prompt error', {promptError: err}) );

        } else if ( ( ! result ) || ( ! result[grantPrompt] ) || ( result[grantPrompt] !== 'y' ) ) {
          console.log('Aborted!');
          callback();

        } else {
          grantUserUtils.grantUserPromotionAction( userEmail, serverCommonConstants.PROMOTION_TYPE_FACEBOOK_LIKE, callback );
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
  grantUserFacebookLike.run( grantUserFacebookLike.finish );
});