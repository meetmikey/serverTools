
var serverCommon = process.env.SERVER_COMMON;

var winston = require(serverCommon + '/lib/winstonWrapper').winston
	, userQueueUtils = require('./userQueueUtils')
	, upgradeUtils = require(serverCommon + '/lib/upgradeUtils')
	, mailDownloadUtils = require(serverCommon + '/lib/mailDownloadUtils')
	, ExtraDaysModel = require(serverCommon + '/schema/extraDays').ExtraDaysModel
	, UserModel = require(serverCommon + '/schema/user').UserModel

var grantUserUtils = this;

exports.grantUserExtraDays = function( userEmail, numExtraDays, grantorLastName, callback ) {
	if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail') ); return; }
	if ( ! numExtraDays ) { callback( winston.makeMissingParamError('numExtraDays') ); return; }
	if ( ! grantorLastName ) { callback( winston.makeMissingParamError('grantorLastName') ); return; }

	UserModel.findOne({email:userEmail}, function(mongoErr, foundUser) {
		if ( mongoErr ) {
			callback( winston.makeMongoError(mongoErr) );

		} else if ( ! foundUser ) {
			callback( winston.makeMissingParamError('user') );

		} else {
			var userId = foundUser._id;
			var extraDays = new ExtraDaysModel({
					userId: userId
				, numExtraDays: numExtraDays
				, grantorLastName: grantorLastName
			});

			extraDays.save( function(mongoErr) {
				if ( mongoErr ) {
					callback( winston.makeMongoError(mongoErr) );

				} else {
					upgradeUtils.updateUserAccountStatusByUserId( userId, false, callback );
				}
			});
		}
	});
}


exports.grantUserPremium = function( userEmail, callback ) {
  if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail') ); return; }
  var startingPoint = undefined;

  var updateData = {$set: {
      isPremium: true
    , isGrantedPremium: true
  }};

  UserModel.findOneAndUpdate({email: userEmail}, updateData, function(mongoErr, foundUser) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else {
      mailDownloadUtils.createResumeDownloadNow( foundUser, startingPoint, true, callback );
    }
  });
}