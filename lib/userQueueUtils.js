var serverCommon = process.env.SERVER_COMMON;

var UserModel = require(serverCommon + '/schema/user').UserModel
  , ResumeDownloadStateModel = require(serverCommon + '/schema/onboard').ResumeDownloadStateModel
  , UserOnboardingStateModel = require (serverCommon + '/schema/onboard').UserOnboardingStateModel
  , MailBoxModel = require (serverCommon + '/schema/mail').MailBoxModel
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , constants = require (serverCommon + '/constants')
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

exports.findAndAddUserToResumeTable = function (userEmail, lastCompleted, callback) {
  if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail' ) ); return; }

  UserModel.findOne({email: userEmail}, function(err, foundUser) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      winston.doWarn('No user found', {userEmail: userEmail});
      callback();

    } else {
      mailDownloadUtils.createResumeDownloadNow( foundUser, lastCompleted, true, callback );
    }
  });
}

exports.addAllUsersToResumeTable = function () {
  var lastCompleted = 'markMarketingTextEmails';
  var exclude = []

  // find all users who have been successfully onboarded
  var query = UserOnboardingStateModel.find ({lastCompleted : 'markStoppingPoint'});
  query.select ('userId');
  query.limit (10);
  query.exec (function (err, state) {
    if (err) {
      winston.doMongoError (err);
      return;
    }

    async.eachSeries (states, function (state, cb) {
      UserModel.findById (state.userId, function (err, user) {
        if (err) { cb (winston.makeMongoError (err)); }


        if ( exclude.indexOf( String( user._id ) ) != -1 ) {
          winston.doInfo('not creating for user', {email: user.email});
          return;
        }

        exports.createResumeDownloadNowSpecial( user, lastCompleted, true, function(err) {
          if ( err ) {
            winston.handleError( err );

          } else {
            winston.doInfo('done with user', {email: foundUser.email});
          }
        });


      });
    }, 
    function (err) {
      winston.doMongoError ('could not add all users', {err : err});
    });


}



exports.createResumeDownloadNowSpecial = function( user, lastCompleted, forceCreation, callback ) {
  if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }

  var userId = user._id;
  MailBoxModel.findOne ({userId : userId}, function( mongoErr, foundMailbox ) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if ( ! foundMailbox ) {
      callback( winston.makeError('No mailbox found', {userId: userId}) );

    } else {

      var resume = new ResumeDownloadStateModel({
        userId : userId,
        mailBoxId : foundMailbox._id,
        maxUid : foundMailbox.uidNext -1,
        resumeAt : Date.now()
      });

      // for premium users there's no minDate on the task
      if (user.isPremium) {
        resume.isPremium = true;
      } else {
        // the new job is only responsible for this interval of time
        resume.minDate = new Date (Date.now() - user.daysLimit*constants.ONE_DAY_IN_MS)
      }

      if (lastCompleted) {
        resume.lastCompleted = lastCompleted;
      }

      if (!user.isPremium && resume.maxDate.getTime() < resume.minDate.getTime() && !forceCreation) {
        callback ();
      } else {
        resume.save( function( err ) {
          if ( err ) {
            callback( winston.makeMongoError( err ) );
          } else {

            // if the resume has a minDate we need to modify
            // this on the user too so that we don't double
            // the same time period twice...
            if (resume.minDate) {
              user.lastResumeJobEndDate = resume.minDate;

              user.save (function (err) {
                if (err) {
                  callback( winston.makeMongoError( err ) );
                } else {
                  callback();
                }
              });
            } else {
              callback();
            }
          }
        });
      }

    }
  });
}