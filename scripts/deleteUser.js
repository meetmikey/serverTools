var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , async = require('async')
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
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , elasticSearchClient = require(serverCommon + '/lib/esConnect').client()
  , esUtils = require(serverCommon + '/lib/esUtils')
  , attachmentUtils = require(serverCommon + '/lib/attachmentUtils')
  , prompt = require('prompt')

var BATCH_SIZE = 50;

if ( ( ! process ) || ( ! process.argv ) || ( process.argv.length < 3 ) ) {
  winston.doWarn('Missing params: usage: node deleteUser.js <email> <also delete user object (true/false)>');
  process.exit(1);
}

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'deletUser', initActions, conf, function() {

  var deleteUser = {
    
    run: function( callback ) {

      var userEmail = process.argv[2];
      var deleteUserObject = false;
      if ( ( process.argv.length >= 4 ) && ( process.argv[3] == 'true' ) ) {
        deleteUserObject = true;
      }

      prompt.start();
      var message = 'This will delete EVERYTHING about this user';
      if ( deleteUserObject ) {
        message += ', including the user itself';
      }
      message += '.  Are you SURE?';
      console.log();
      console.log( message );

      var deletePrompt = 'delete this user? (y/n)'
      prompt.get([deletePrompt], function (err, result) {
        if ( err ) {
          winston.doError('prompt error', {promptError: err});
          deleteUser.finish();

        } else if ( ( ! result ) || ( ! result[deletePrompt] ) || ( result[deletePrompt] !== 'y' ) ) {
          console.log('Aborted!');
          deleteUser.finish();

        } else {
          deleteUser.performUserDelete( userEmail, deleteUserObject, deleteUser.finish );
        }
      });
    }

    , finish: function() {
      mongoose.disconnect();
    }

    , performUserDelete: function( userEmail, deleteUserObject, callback ) {

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
              function( seriesCallback ) { deleteUser.deleteUserOnboardingStates( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteAttachments( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteLinks( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteActiveConnections( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteMailboxes( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteMails( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteReceiveMRs( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteResumeDownloadStates( foundUser, shardKey, seriesCallback ); }
            , function( seriesCallback ) { deleteUser.deleteSentAndCoReceiveMRs( foundUser, shardKey, seriesCallback ); }
          ];

          if ( deleteUserObject ) {
            actions.push( function( seriesCallback ) { deleteUser.deleteUser( foundUser, shardKey, seriesCallback ); } );
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

    , deleteUserOnboardingStates: function( user, shardKey, callback ) {
      winston.doInfo('deleting userOnboardingStates...');
      deleteUser.deleteFromCollectionByUserId( UserOnboardingStateModel, user._id, 'userId', callback );
    }

    , deleteAttachments: function( user, shardKey, callback ) {

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
                  deleteUser.checkAndDeleteAttachmentFromCloudStorage( attachment, function(err) {
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

    , checkAndDeleteAttachmentFromCloudStorage: function( attachment, callback ) {

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

    , deleteLinks: function( user, shardKey, callback ) {

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

    , deleteActiveConnections: function( user, shardKey, callback ) {
      winston.doInfo('deleting activeConnections...');
      deleteUser.deleteFromCollectionByUserId( ActiveConnectionModel, user._id, '_id', callback );
    }

    , deleteMailboxes: function( user, shardKey, callback ) {
      winston.doInfo('deleting mailboxes...');
      deleteUser.deleteFromCollectionByUserId( MailBoxModel, user._id, 'userId', callback );
    }

    , deleteMails: function( user, shardKey, callback ) {
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
                  deleteUser.deleteMailBodyFromStorage( mail, eachCallback );
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

    , deleteMailBodyFromStorage: function( mail, callback ) {
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

    , deleteReceiveMRs: function( user, shardKey, callback ) {
      winston.doInfo('deleting receiveMRs...');
      deleteUser.deleteFromCollectionByUserId( ReceiveMRModel, user._id, '_id.userId', callback );
    }

    , deleteResumeDownloadStates: function( user, shardKey, callback ) {
      winston.doInfo('deleting resumeDownloadStates...');
      deleteUser.deleteFromCollectionByUserId( ResumeDownloadStateModel, user._id, 'userId', callback );
    }

    , deleteSentAndCoReceiveMRs: function( user, shardKey, callback ) {
      winston.doInfo('deleting sentAndCoReceiveMRs...');
      deleteUser.deleteFromCollectionByUserId( SentAndCoReceiveMRModel, user._id, '_id.userId', callback );
    }

    , deleteUser: function( user, shardKey, callback ) {
      winston.doInfo('deleting user...');
      deleteUser.deleteFromCollectionByUserId( UserModel, user._id, '_id', callback );
    }

    , deleteFromCollectionByUserId: function( model, userId, idField, callback ) {
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
  }

  //Do it.
  deleteUser.run();
});