var serverCommon = process.env.SERVER_COMMON;

var async = require('async')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , UserModel = require(serverCommon + '/schema/user').UserModel
  , AttachmentModel = require(serverCommon + '/schema/attachment').AttachmentModel
  , UserOnboardingStateModel = require(serverCommon + '/schema/onboard').UserOnboardingStateModel
  , ResumeDownloadStateModel = require(serverCommon + '/schema/onboard').ResumeDownloadStateModel
  , LinkModel = require(serverCommon + '/schema/link').LinkModel
  , MailModel = require(serverCommon + '/schema/mail').MailModel
  , MailBoxModel = require(serverCommon + '/schema/mail').MailBoxModel
  , ActiveConnectionModel = require(serverCommon + '/schema/active').ActiveConnectionModel
  , ReceiveMRModel = require(serverCommon + '/schema/contact').ReceiveMRModel
  , SentAndCoReceiveMRModel = require(serverCommon + '/schema/contact').SentAndCoReceiveMRModel
  , mongoUtils = require(serverCommon + '/lib/mongoUtils')
  , cloudStorageUtils = require(serverCommon + '/lib/cloudStorageUtils')
  , esUtils = require(serverCommon + '/lib/esUtils')
  , attachmentUtils = require(serverCommon + '/lib/attachmentUtils')

var BATCH_SIZE = 50;

var deleteUserData = this;

exports.performUserDelete = function( userEmail, deleteUserObject, callback ) {

  winston.doInfo('running...', {email: userEmail, deleteUserObject: deleteUserObject});

  UserModel.findOne( {email: userEmail}, function( err, foundUser ) {
    if ( err ) {
      winston.doMongoError( err );
      callback();

    } else if ( ! foundUser ) {
      winston.doInfo('No user found with email: ' + userEmail);
      callback();

    } else {
      winston.doInfo('foundUser', {user: foundUser});
      var shardKey = mongoUtils.getShardKeyHash( foundUser._id );

      var actions = [
          function( seriesCallback ) { deleteUserData.deleteUserOnboardingStates( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteAttachments( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteLinks( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteActiveConnections( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteMailboxes( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteMails( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteReceiveMRs( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteResumeDownloadStates( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserData.deleteSentAndCoReceiveMRs( foundUser, shardKey, seriesCallback ); }
      ];

      if ( deleteUserObject ) {
        actions.push( function( seriesCallback ) { deleteUserData.deleteUser( foundUser, shardKey, seriesCallback ); } );
      }

      async.series( actions, function(err) {
        if ( err ) {
          winston.handleError( err );

        } else {
          winston.doInfo('All done!');
        }
        callback();
      });
    }
  });
}

exports.deleteUserOnboardingStates = function( user, shardKey, callback ) {
  winston.doInfo('deleting userOnboardingStates...');
  deleteUserData.deleteFromCollectionByUserId( UserOnboardingStateModel, user._id, 'userId', callback );
}

exports.deleteAttachments = function( user, shardKey, callback ) {

  if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }
  if ( ! shardKey ) { callback( winston.makeMissingParamError('shardKey') ); return; }

  winston.doInfo('deleting attachments...');

  var query = AttachmentModel.find({userId: user._id, shardKey: shardKey});

  var done = false;
  async.whilst( function() { return ( ! done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundAttachments) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) );

      } else if ( ( ! foundAttachments ) || ( ! ( foundAttachments.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {
        async.each( foundAttachments, function( attachment, eachCallback ) {
          //winston.doInfo('attachment', {attachment:attachment});

          var attachmentId = attachment._id;
          AttachmentModel.findByIdAndRemove( attachmentId, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              deleteUserData.checkAndDeleteAttachmentFromCloudStorage( attachment, function(err) {
                if ( err ) {
                  eachCallback( err );

                } else {
                  esUtils.delete( 'mail', 'resourceMeta', String(attachmentId), function( esUtilsError ) {
                    if ( esUtilsError ) {
                      eachCallback( winston.makeError('esUtilsError', {esUtilsError: esUtilsError}));

                    } else {
                      eachCallback();
                    }
                  });
                }
              });
            }
          });

        }, function(err) {
          whilstCallback(err);
        });
      }
    });

  }, function( err ) {
    callback(err);
  });
}

exports.checkAndDeleteAttachmentFromCloudStorage = function( attachment, callback ) {

  if ( ! attachment ) { callback( winston.makeMissingParamError('attachment') ); return; }

  AttachmentModel.find({hash: attachment.hash, fileSize: attachment.fileSize}, function(mongoErr, foundAttachments) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if ( foundAttachments  && ( foundAttachments.length > 0 ) ) {
      //Other attachments exist.  Don't delete!
      callback();

    } else {
      var path = cloudStorageUtils.getAttachmentPath( attachment );
      var inAzure = false;
      cloudStorageUtils.deleteFile( path, inAzure, function(err) {
        if ( err ) {
          callback( err );

        } else {
          var fileContentId = attachmentUtils.getFileContentId( attachment );
          esUtils.delete( 'mail', 'resource', fileContentId, function( esUtilsError ) {
            if ( esUtilsError ) {
              callback( winston.makeError('esUtilsError', {esUtilsError: esUtilsError}));

            } else {
              callback();
            }
          });
        }
      });
    }
  });
}

exports.deleteLinks = function( user, shardKey, callback ) {

  if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }
  if ( ! shardKey ) { callback( winston.makeMissingParamError('shardKey') ); return; }

  winston.doInfo('deleting links...');

  var query = LinkModel.find({userId: user._id, shardKey: shardKey});

  var done = false;
  async.whilst( function() { return ( ! done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundLinks) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) );

      } else if ( ( ! foundLinks ) || ( ! ( foundLinks.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {
        async.each( foundLinks, function( link, eachCallback ) {
          //winston.doInfo('link', {link:link});

          var linkId = link._id;
          LinkModel.findByIdAndRemove( linkId, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              esUtils.delete( 'mail', 'resourceMeta', String(linkId), function( esUtilsError ) {
                if ( esUtilsError ) {
                  eachCallback( winston.makeError('esUtilsError', {esUtilsError: esUtilsError}));

                } else {
                  eachCallback();
                }
              });
            }
          });

        }, function(err) {
          whilstCallback(err);
        });
      }
    });

  }, function( err ) {
    callback(err);
  });
}

exports.deleteActiveConnections = function( user, shardKey, callback ) {
  winston.doInfo('deleting activeConnections...');
  deleteUserData.deleteFromCollectionByUserId( ActiveConnectionModel, user._id, '_id', callback );
}

exports.deleteMailboxes = function( user, shardKey, callback ) {
  winston.doInfo('deleting mailboxes...');
  deleteUserData.deleteFromCollectionByUserId( MailBoxModel, user._id, 'userId', callback );
}

exports.deleteMails = function( user, shardKey, callback ) {
  winston.doInfo('deleting mails...');

  var query = MailModel.find({userId: user._id, shardKey: shardKey});

  var done = false;
  async.whilst( function() { return ( ! done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundMails) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) );

      } else if ( ( ! foundMails ) || ( ! ( foundMails.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {
        async.each( foundMails, function( mail, eachCallback ) {
          //winston.doInfo('mail', {mail:mail});

          MailModel.findByIdAndRemove( mail._id, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              deleteUserData.deleteMailBodyFromStorage( mail, eachCallback );
            }
          });

        }, function(err) {
          whilstCallback(err);
        });
      }
    });

  }, function( err ) {
    callback(err);
  });
}

exports.deleteMailBodyFromStorage = function( mail, callback ) {
  if ( ! mail ) { callback( winston.makeMissingParamError('mail') ); return; }

  if ( ( ! mail ) || ( mail.bodyInS3 !== 'success' ) ) {
    callback();

  } else {
    var cloudPath = cloudStorageUtils.getMailBodyPath( mail );
    var inAzure = false;
    cloudStorageUtils.deleteFile( cloudPath, inAzure, function(err) {
      if ( err ) {
        winston.doWarn("Failed to delete mailBody from S3! Maybe it wasn't there?", {cloudPath: cloudPath});
      }
      callback();
    });
  }
}

exports.deleteReceiveMRs = function( user, shardKey, callback ) {
  winston.doInfo('deleting receiveMRs...');
  deleteUserData.deleteFromCollectionByUserId( ReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteResumeDownloadStates = function( user, shardKey, callback ) {
  winston.doInfo('deleting resumeDownloadStates...');
  deleteUserData.deleteFromCollectionByUserId( ResumeDownloadStateModel, user._id, 'userId', callback );
}

exports.deleteSentAndCoReceiveMRs = function( user, shardKey, callback ) {
  winston.doInfo('deleting sentAndCoReceiveMRs...');
  deleteUserData.deleteFromCollectionByUserId( SentAndCoReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteUser = function( user, shardKey, callback ) {
  winston.doInfo('deleting user...');
  deleteUserData.deleteFromCollectionByUserId( UserModel, user._id, '_id', callback );
}

exports.deleteFromCollectionByUserId = function( model, userId, idField, callback ) {
  if ( ! model ) { callback( winston.makeMissingParamError('model') ); return; }
  if ( ! userId ) { callback( winston.makeMissingParamError('userId') ); return; }
  if ( ! idField ) { callback( winston.makeMissingParamError('idField') ); return; }

  var filter = {};
  filter[idField] = userId;

  model.remove(filter, function(err) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else {
      callback();
    }
  });
}