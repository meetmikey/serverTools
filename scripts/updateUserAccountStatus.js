var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , upgradeUtils = require(serverCommon + '/lib/upgradeUtils')
  , UserModel = require(serverCommon + '/schema/user').UserModel

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node udpateUserAccountStatus.js <email>');
  process.exit(1);
}

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'udpateUserAccountStatus', initActions, conf, function() {

  var udpateUserAccountStatus = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];
      UserModel.findOne( {email: userEmail }, function(mongoErr, user) {
        if ( mongoErr ) {
          callback( winston.makeMongoError( mongoErr ) );

        } else if ( ! user ) {
          callback( winston.makeError('no user', {email: userEmail}) );

        } else {
          upgradeUtils.updateUserAccountStatus( user, true, callback );
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
  udpateUserAccountStatus.run( udpateUserAccountStatus.finish );
});