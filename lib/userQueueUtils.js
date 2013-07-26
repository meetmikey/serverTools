var serverCommon = process.env.SERVER_COMMON;

var UserModel = require(serverCommon + '/schema/user').UserModel
  , ResumeDownloadStateModel = require(serverCommon + '/schema/onboard').ResumeDownloadStateModel
  , MailBoxModel = require (serverCommon + '/schema/mail').MailBoxModel
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , sqsConnect = require(serverCommon + '/lib/sqsConnect')
  , mailDownloadUtils = require(serverCommon + '/lib/mailDownloadUtils')

var userQueueUtils = this;

exports.addUserToDownloadQueue = function( userEmail, callback ) {

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
          callback( winston.makeError('Could not add message to start downloading user data', foundUser._id) );

        } else {
          winston.doInfo('Added user to download queue!', {user: foundUser});
          callback();
        }
      });
    }
  });
};

exports.findAndAddUserToResumeTable = function (userEmail, callback) {
  if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail' ) ); return; }

  UserModel.findOne({email: userEmail}, function(err, foundUser) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      winston.doWarn('No user found', {userEmail: userEmail});
      callback();

    } else {
      mailDownloadUtils.createResumeDownloadNow( foundUser, callback );
    }
  });
}

exports.addAllUsersToResumeTable = function () {

  var exclude = []

  UserModel.find({}, function(mongoErr, foundUsers) {
    if ( mongoErr ) {
       winston.doMongoError( mongoErr ) ;

    } else {
      foundUsers.forEach( function(foundUser) {

        var foundUserId = foundUser._id;

        if ( exclude.indexOf( String( foundUserId ) ) != -1 ) {
          winston.doInfo('not creating for user', {email: foundUser.email});
          return;
        }

        mailDownloadUtils.createResumeDownloadNow( foundUser, function(err) {
          if ( err ) {
            winston.handleError( err );

          } else {
            winston.doInfo('done with user', {email: foundUser.email});
          }
        });
      });
    }
  });
}