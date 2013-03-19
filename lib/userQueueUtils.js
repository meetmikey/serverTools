var serverCommon = process.env.SERVER_COMMON;

var UserModel = require(serverCommon + '/schema/user').UserModel
  , ResumeDownloadStateModel = require(serverCommon + '/schema/onboard').ResumeDownloadStateModel
  , MailBoxModel = require (serverCommon + '/schema/mail').MailBoxModel
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , sqsConnect = require(serverCommon + '/lib/sqsConnect')

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


exports.addUserToResumeTable = function (userEmail, callback) {
  if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail' ) ); return; }

  UserModel.findOne({email: userEmail}, function(err, foundUser) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      winston.doWarn('No user found', {userEmail: userEmail});
      callback();

    } else {
      MailBoxModel.findOne ({userId : foundUser._id}, function (err, foundMailbox) {
        if (err) {
          callback( winston.makeMongoError( err ) );
        }
        else if (!foundMailbox) {
          winston.doWarn('No mailbox found', {userId: foundUser._id});
          callback();

        }
        else{
          var resume = new ResumeDownloadStateModel({
            userId : foundUser._id,
            mailBoxId : foundMailbox._id,
            maxUid : foundMailbox.uidNext -1,
            resumeAt : Date.now()
          })

          resume.save (function (err) {
            if (err) {
              callback( winston.makeMongoError( err ) );
            }
            else {
              callback();
            }
          });
        }
      });
    }
  });

}