/*jshint maxerr: 1000 */
var serverCommon = process.env.SERVER_COMMON;

var async = require('async')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , UserModel = require(serverCommon + '/schema/user').UserModel
  , DeletedUserModel = require(serverCommon + '/schema/user').DeletedUserModel
  , AttachmentModel = require(serverCommon + '/schema/attachment').AttachmentModel
  , AttachmentInfoModel = require(serverCommon + '/schema/attachmentInfo').AttachmentInfoModel
  , LinkInfoModel = require(serverCommon + '/schema/linkInfo').LinkInfoModel
  , UserOnboardingStateModel = require(serverCommon + '/schema/onboard').UserOnboardingStateModel
  , ResumeDownloadStateModel = require(serverCommon + '/schema/onboard').ResumeDownloadStateModel
  , LinkModel = require(serverCommon + '/schema/link').LinkModel
  , MailModel = require(serverCommon + '/schema/mail').MailModel
  , MailBoxModel = require(serverCommon + '/schema/mail').MailBoxModel
  , ActiveConnectionModel = require(serverCommon + '/schema/active').ActiveConnectionModel
  , ReceiveMRModel = require(serverCommon + '/schema/contact').ReceiveMRModel
  , SentAndCoReceiveMRModel = require(serverCommon + '/schema/contact').SentAndCoReceiveMRModel
  , BandwithModel = require (serverCommon + '/schema/onboard').BandwithModel
  , cloudStorageUtils = require(serverCommon + '/lib/cloudStorageUtils')
  , esUtils = require(serverCommon + '/lib/esUtils');

var BATCH_SIZE = 50;

var deleteUserUtils = this;

exports.performUserDelete = function( userEmail, deleteUserObject, callback ) {

  winston.doInfo('running...', {email: userEmail, deleteUserObject: deleteUserObject});

  UserModel.findOne( {email: userEmail}, function( err, foundUser ) {
    if ( err ) {
      callback( winston.makeMongoError( err ) );

    } else if ( ! foundUser ) {
      callback( winston.makeError('no user', {email: userEmail}) );

    } else if ( foundUser.billingPlan && ( foundUser.billingPlan != 'free' ) ) {
      callback( winston.makeError('User has a billing plan!!! Aborting', {email: userEmail, billingPlan: foundUser.billingPlan}) );

    } else {
      winston.doInfo('foundUser', {user: foundUser});

      var deletedUser = deleteUserUtils.createDeletedUserFromUser( foundUser, deleteUserObject );

      deletedUser.save( function( mongoErr ) {
        if ( mongoErr ) {
          callback( winston.makeMongoError( mongoErr ) );

        } else {
          var actions = [
              function( seriesCallback ) { deleteUserUtils.deleteUserOnboardingStates( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteAttachmentsByUser( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteLinks( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteActiveConnections( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteMailboxes( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteMails( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteReceiveMRs( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteResumeDownloadStates( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteBandwiths ( foundUser, seriesCallback ); }
            , function( seriesCallback ) { deleteUserUtils.deleteSentAndCoReceiveMRs( foundUser, seriesCallback ); }
            ];

          if ( deleteUserObject ) {
            actions.push( function( seriesCallback ) { deleteUserUtils.deleteUser( foundUser, seriesCallback ); } );
          }

          async.series( actions, function(err) {
            if ( err ) {
              callback( err );

            } else {
              deletedUser.isComplete = true;
              deletedUser.save( function(mongoErr) {
                if ( mongoErr ) {
                  callback( winston.makeMongoError( mongoErr ) );

                } else {
                  winston.doInfo('All done!');
                  callback();
                }
              });
            }
          });
        }
      });
    }
  });
}

exports.deleteUserOnboardingStates = function( user, callback ) {
  winston.doInfo('deleting userOnboardingStates...');
  deleteUserUtils.deleteFromCollectionByUserId( UserOnboardingStateModel, user._id, 'userId', callback );
}

exports.deleteAttachmentsByUser = function( user, callback ) {

  if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }

  var filter = {userId: user._id};
  deleteUserUtils.deleteAttachments(filter, callback);
}

exports.deleteAttachments = function( filter, callback ) {

  if ( ! filter ) { callback( winston.makeMissingParamError('filter') ); return; }

  winston.doInfo('deleting attachments...');

  var query = AttachmentModel.find( filter );

  var done = false;
  async.whilst( function() { return ( ! done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundAttachments) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) )

      } else if ( ( ! foundAttachments ) || ( ! ( foundAttachments.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {
        async.each( foundAttachments, function( attachment, eachCallback ) {
          //winston.doInfo('attachment', {attachment:attachment});

          deleteUserUtils.checkAndDeleteAttachmentInfo( attachment, function(err) {
            if ( err ) {
              eachCallback( err );

            } else {
              esUtils.delete( esUtils.getIndexAliasForUser (attachment.userId), 'document', String(attachment._id), null, 
                function( esUtilsError ) {
                  if ( esUtilsError ) {
                    eachCallback( winston.makeError('esUtilsError', {esUtilsError: esUtilsError}));
                  } else {
                    deleteUserUtils.removeObjectAndCallback (attachment, eachCallback);
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

exports.checkAndDeleteAttachmentInfo = function( attachment, callback ) {

  if ( ! attachment ) { callback( winston.makeMissingParamError('attachment') ); return; }

  AttachmentModel.count({hash: attachment.hash, fileSize: attachment.fileSize}, function(mongoErr, count) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if ( count > 1 ) {
      //Other attachments exist.  Don't delete!
      callback();

    } else {
      deleteUserUtils.deleteAttachmentInfo( attachment, callback );
    }
  });
}

exports.deleteAttachmentInfo = function( attachment, callback ) {

  var hash = attachment.hash;
  var fileSize = attachment.fileSize;

  var filter = {
      hash: hash
    , fileSize: fileSize
  };

  AttachmentInfoModel.findOne( filter, function( mongoErr, attachmentInfo ) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if (attachmentInfo) {
      var path = cloudStorageUtils.getAttachmentPath( attachment );
      var inAzure = false;
      cloudStorageUtils.deleteFile( path, inAzure, function(err) {

        if (err) {
          callback (err);
          return;
        } else if (attachment.attachmentThumbExists) {
          cloudStorageUtils.deleteFile (path + "_thumb", inAzure, function (err) {
            if (err) { 
              callback (err);
            } else {
              deleteUserUtils.removeObjectAndCallback (attachmentInfo, callback);
            }
          });
        } else {
          deleteUserUtils.removeObjectAndCallback (attachmentInfo, callback);
        }
      });
    } else {
      winston.doWarn ('no attachmentInfo found', filter);
      callback();
    }
  });
}

exports.deleteLinks = function( user, callback ) {

  if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }

  winston.doInfo('deleting links...');

  var query = LinkModel.find({userId: user._id});

  var done = false;
  async.whilst( function() { return ( !done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundLinks) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) );

      } else if ( ( !foundLinks ) || ( !(foundLinks.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {

        async.each( foundLinks, function( link, eachCallback ) {
          //winston.doInfo('link', {link:link});

          deleteUserUtils.checkAndDeleteLinkInfo (link, function (err) {
            if (err) {
              eachCallback (err);
            } else {
              esUtils.delete( esUtils.getIndexAliasForUser (user._id), 'document', String(link._id), null, function( esUtilsError ) {
                if ( esUtilsError ) {
                  eachCallback( winston.makeError('esUtilsError', {esUtilsError: esUtilsError}));

                } else {
                  deleteUserUtils.removeObjectAndCallback (link, eachCallback);
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


exports.checkAndDeleteLinkInfo = function( link, callback ) {

  if ( ! link ) { callback( winston.makeMissingParamError('link') ); return; }

  LinkModel.count({comparableURLHash: link.comparableURLHash}, function(mongoErr, count) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if ( count > 1 ) {
      //Other links exist.  Don't delete!
      callback();

    } else {
      deleteUserUtils.deleteLinkInfo( link, callback );
    }
  });
}

exports.deleteLinkInfo = function( link, callback ) {

  var comparableURLHash = link.comparableURLHash;

  var filter = {
    comparableURLHash: comparableURLHash
  };

  LinkInfoModel.findOne( filter, function( mongoErr, linkInfo ) {
    if ( mongoErr ) {
      callback( winston.makeMongoError( mongoErr ) );

    } else if (linkInfo) {
      // get rid of the file
      var path = cloudStorageUtils.getLinkInfoPath( linkInfo );
      var inAzure = false;
      cloudStorageUtils.deleteFile( path, inAzure, function(err) {
        if (err) { callback (err); return; }

        deleteUserUtils.removeObjectAndCallback (linkInfo, callback);
      });
    } else {
      winston.doWarn ('linkinfo not found', filter);
      callback();      
    }
  });
}

exports.deleteActiveConnections = function( user, callback ) {
  winston.doInfo('deleting activeConnections...');
  deleteUserUtils.deleteFromCollectionByUserId( ActiveConnectionModel, user._id, '_id', callback );
}

exports.deleteMailboxes = function( user, callback ) {
  winston.doInfo('deleting mailboxes...');
  deleteUserUtils.deleteFromCollectionByUserId( MailBoxModel, user._id, 'userId', callback );
}

exports.deleteMails = function( user, callback ) {
  winston.doInfo('deleting mails...');

  var query = MailModel.find({userId: user._id});

  var done = false;
  async.whilst( function() { return ( !done ); }, function( whilstCallback ) {

    query.limit( BATCH_SIZE ).exec( function(err, foundMails) {
      if ( err ) {
        whilstCallback( winston.makeMongoError( err ) );

      } else if ((!foundMails) || (!(foundMails.length > 0 ) ) ) {
        done = true;
        whilstCallback();

      } else {
        async.each( foundMails, function( mail, eachCallback ) {

          deleteUserUtils.deleteMailBodyFromStorage (mail, function (err) {
            if (err) { eachCallback (err); return; }

            deleteUserUtils.deleteRawEmailFromStorage (mail, function (err) {
              if (err) {eachCallback (err); return; } 

              deleteUserUtils.removeObjectAndCallback (mail, eachCallback);
            })
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

exports.deleteRawEmailFromStorage = function (mail, callback) {
  winston.doInfo ('deleteRawEmailFromStorage', {_id : mail._id});

  if (!mail || !mail.s3Path) {
    callback ();
  } else {
    cloudStorageUtils.deleteFile(mail.s3Path, true, function (err) {
      if (err) {
        winston.doWarn('Failed to delete rawEamil from S3! Maybe it wasn\'t there?', {cloudPath: mail.s3Path});
      }
      callback();
    });
  }
}

exports.deleteMailBodyFromStorage = function( mail, callback ) {
  winston.doInfo ('deleteMailBodyFromStorage', {_id : mail._id});

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

exports.deleteReceiveMRs = function( user, callback ) {
  winston.doInfo('deleting receiveMRs...');
  deleteUserUtils.deleteFromCollectionByUserId( ReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteResumeDownloadStates = function( user, callback ) {
  winston.doInfo('deleting resumeDownloadStates...');
  deleteUserUtils.deleteFromCollectionByUserId( ResumeDownloadStateModel, user._id, 'userId', callback );
}

exports.deleteBandwiths = function( user, callback ) {
  winston.doInfo('deleting bandwiths...');
  deleteUserUtils.deleteFromCollectionByUserId( BandwithModel, user._id, 'userId', callback );
}

exports.deleteSentAndCoReceiveMRs = function( user, callback ) {
  winston.doInfo('deleting sentAndCoReceiveMRs...');
  deleteUserUtils.deleteFromCollectionByUserId( SentAndCoReceiveMRModel, user._id, '_id.userId', callback );
}

exports.deleteUser = function( user, callback ) {
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

exports.removeObjectAndCallback = function (model, callback) {
  model.remove (function (err) {
    if (err) {
      callback (winston.makeMongoError (err));
    } else {
      callback ();
    }
  })
}

exports.createDeletedUserFromUser = function( user, userWasDeletedInput ) {

  var userWasDeleted = false;
  if ( userWasDeletedInput ) {
    userWasDeleted = true;
  }

  if ( ! user ) {
    winston.doError('no user!');
    return null;
  }

  var deletedUser = new DeletedUserModel({
      userId: user._id
    , shortId: user.shortId
    , googleID: user.googleID
    , displayName: user.displayName
    , firstName: user.firstName
    , lastName: user.lastName
    , email: user.email
    , userDeleted: userWasDeleted
    , userTimestamp: user.timestamp
    , deleteTimestamp: Date.now()
  });

  return deletedUser;
}