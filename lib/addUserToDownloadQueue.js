var serverCommon = process.env.SERVER_COMMON;

var UserModel = require(serverCommon + '/schema/user').UserModel
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , sqsConnect = require(serverCommon + '/lib/sqsConnect')

var addUserToDownloadQueue = this;

exports.addUser = function( userEmail, callback ) {

  if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail' ) ); return; }

  UserModel.findOne({email: userEmail}, function(err, foundUser) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      winston.doWarn('No user found', {userEmail: userEmail});
      callback();

    } else {
      sqsConnect.addMessageToMailDownloadQueue( foundUser, function (err, msg) {
        if ( err ) {
          callback( winston.makeError('Could not add message to start downloading user data', user._id);

        } else {
          winston.doInfo('Added user to download queue!', {user: user});
          callback();
        }
      });
    }
  });
});


