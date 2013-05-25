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

exports.addAllUsersToResumeTable = function () {

  var exclude = [
    "519d8b0a360be9fa7d014147",
    "517f0b8a15690a5225000011",
    "5190eb89977e6a501100000a",
    "519e43fed84988c86401548b",
    "519bb79fda39454d5400b262",
    "519e772b360be9fa7d01f62e",
    "51995b5991b1e9692805f523"
  ]

  UserModel.find({}, function(err, foundUsers) {
    if ( err ) {
       winston.doMongoError( err ) ;

    } else {

      foundUsers.forEach (function (foundUser) {

        if (exclude.indexOf (String (foundUser._id)) != -1) {
          console.log ('not creating for user', foundUser.email);
          return;
        }

        MailBoxModel.findOne ({userId : foundUser._id}, function (err, foundMailbox) {
          if (err) {
            winston.doMongoError( err );
          }
          else if (!foundMailbox) {
            winston.doWarn('No mailbox found', {userId: foundUser._id});

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
                winston.doMongoError( err );
              }
              else {
                console.log ('done with user', foundUser.email);
              }
            });
          }
        });
      });
    }
  })

}