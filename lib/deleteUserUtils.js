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
  , esConnect = require(serverCommon + '/lib/esConnect')
  , attachmentUtils = require(serverCommon + '/lib/attachmentUtils')

var BATCH_SIZE = 50;

var deleteUserUtils = this;

exports.performUserDelete = function( userEmail, deleteUserObject, callback ) {

  winston.doInfo('running...', {email: userEmail, deleteUserObject: deleteUserObject});

  UserModel.findOne( {email: userEmail}, function( err, foundUser ) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      winston.doInfo('No user found with email: ' + userEmail);
      callback();

    } else {
      winston.doInfo('foundUser', {user: foundUser});
      var shardKey = mongoUtils.getShardKeyHash( foundUser._id );

      var actions = [
          function( seriesCallback ) { deleteUserUtils.deleteUserOnboardingStates( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteAttachments( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteLinks( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteActiveConnections( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteMailboxes( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteMails( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteReceiveMRs( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteResumeDownloadStates( foundUser, shardKey, seriesCallback ); }
        , function( seriesCallback ) { deleteUserUtils.deleteSentAndCoReceiveMRs( foundUser, shardKey, seriesCallback ); }
      ];

      if ( deleteUserObject ) {
        actions.push( function( seriesCallback ) { deleteUserUtils.deleteUser( foundUser, shardKey, seriesCallback ); } );
      }

      async.series( actions, function(err) {
        if ( err ) {
          callback( err );

        } else {
          winston.doInfo('All done!');
          callback();
        }
      });
    }
  });
}

exports.deleteUserOnboardingStates = function( user, shardKey, callback ) {
  winston.doInfo('deleting userOnboardingStates...');
  deleteUserUtils.deleteFromCollectionByUserId( UserOnboardingStateModel, user._id, 'userId', callback );
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
          var filter = {
              _id: attachmentId
            , shardKey: shardKey
          };
          AttachmentModel.findOneAndRemove( filter, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              deleteUserUtils.checkAndDeleteAttachmentFromCloudStorage( attachment, function(err) {
                if ( err ) {
                  eachCallback( err );

                } else {
                  var fileContentId = attachmentUtils.getFileContentId( attachment );
                  esUtils.delete( esConnect.indexName, 'resourceMeta', String(attachmentId), String(fileContentId), function( esUtilsError ) {
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
          esUtils.delete( esConnect.indexName, 'resource', fileContentId, null, function( esUtilsError ) {
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
          var filter = {
              _id: linkId
            , shardKey: shardKey
          };
          LinkModel.findOneAndRemove( filter, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              esUtils.delete( esConnect.indexName, 'resourceMeta', String(linkId), String(link.comparableURLHash), function( esUtilsError ) {
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
  deleteUserUtils.deleteFromCollectionByUserId( ActiveConnectionModel, user._id, '_id', callback );
}

exports.deleteMailboxes = function( user, shardKey, callback ) {
  winston.doInfo('deleting mailboxes...');
  deleteUserUtils.deleteFromCollectionByUserId( MailBoxModel, user._id, 'userId', callback );
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


          var filter = {
              _id: mail._id
            , shardKey: shardKey
          };
          MailModel.findOneAndRemove( filter, function( mongoErr ) {
            if ( mongoErr ) {
              eachCallback( winston.makeMongoError( mongoErr ) );

            } else {
              deleteUserUtils.deleteMailBodyFromStorage( mail, eachCallback );
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
  deleteUserUtils.deleteFromCollectionByUserId( ReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteResumeDownloadStates = function( user, shardKey, callback ) {
  winston.doInfo('deleting resumeDownloadStates...');
  deleteUserUtils.deleteFromCollectionByUserId( ResumeDownloadStateModel, user._id, 'userId', callback );
}

exports.deleteSentAndCoReceiveMRs = function( user, shardKey, callback ) {
  winston.doInfo('deleting sentAndCoReceiveMRs...');
  deleteUserUtils.deleteFromCollectionByUserId( SentAndCoReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteUser = function( user, shardKey, callback ) {
  winston.doInfo('deleting user...');
  deleteUserUtils.deleteFromCollectionByUserId( UserModel, user._id, '_id', callback );
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