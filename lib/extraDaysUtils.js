
var serverCommon = process.env.SERVER_COMMON;

var winston = require(serverCommon + '/lib/winstonWrapper').winston
	, userQueueUtils = require('./userQueueUtils')
	, referralUtils = require(serverCommon + '/lib/referralUtils')
	, ExtraDaysModel = require(serverCommon + '/schema/extraDays').ExtraDaysModel
	, UserModel = require(serverCommon + '/schema/user').UserModel

exports.grantExtraDays = function( userEmail, numExtraDays, grantorLastName, callback ) {
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
					referralUtils.updateUserDaysLimit( userId, function(err) {
						if ( err ) {
							callback(err);

						} else {
							userQueueUtils.addUserToResumeTable( foundUser, callback );
						}
					});
				}
			});
		}
	});
}