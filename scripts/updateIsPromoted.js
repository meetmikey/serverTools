var serverCommon = process.env.SERVER_COMMON;

var async = require('async')
  , conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , linkUtils = require(serverCommon + '/lib/linkUtils')
  , contactUtils = require(serverCommon + '/lib/contactUtils')
  , indexingHandler = require(serverCommon + '/lib/indexingHandler')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , UserModel = require(serverCommon + '/schema/user').UserModel
  , LinkModel = require(serverCommon + '/schema/link').LinkModel
  , LinkInfoModel = require(serverCommon + '/schema/linkInfo').LinkInfoModel

var LINK_BATCH_SIZE = 50;

var initActions = [
    appInitUtils.CONNECT_MONGO
  , appInitUtils.CONNECT_ELASTIC_SEARCH
];

appInitUtils.initApp( 'updateIsPromoted', initActions, conf, function() {

  var run = function( callback ) {

    var filter = {};

    var query = UserModel.find( filter );
    query.select('_id email')
      .exec( function(err, foundUsers) {
        if ( err ) {
          whilstCallback( winston.makeMongoError( err ) );

        } else if ( ( ! foundUsers ) || ( ! ( foundUsers.length > 0 ) ) ) {
          callback();

        } else {
          async.each( foundUsers, function( user, eachCallback ) {
            processUser( user, eachCallback );
          }, function(err) {
            callback(err);
          });
        }
      });
  }

  var processUser = function( user, callback ) {

    if ( ! user ) { callback( winston.makeMissingParamError('user') ); return; }
    if ( ! user.email ) { callback( winston.makeMissingParamError('user.email') ); return; }

    var userId = user._id;
    var userEmail = user.email;
    var highestLinkId = null;

    winston.doInfo('processing user', {userId: userId, userEmail: userEmail});

    var done = false;
    async.whilst( function() { return ( ! done ); }, function( whilstCallback ) {

      var filter = {
        userId: userId
      };

      if ( highestLinkId ) {
        filter['_id'] = {
          $gt: highestLinkId
        };
      }

      var query = LinkModel.find( filter );
      query.limit( LINK_BATCH_SIZE )
        .sort({_id: 1})
        .exec( function(err, foundLinks) {

          //winston.doInfo('link batch', {userId: userId, highestLinkId: highestLinkId});

          if ( err ) {
            whilstCallback( winston.makeMongoError( err ) );

          } else if ( ( ! foundLinks ) || ( ! ( foundLinks.length > 0 ) ) ) {
            done = true;
            whilstCallback();

          } else {
            async.each( foundLinks, function( link, eachCallback ) {

              processLink( link, userEmail, function(err) {
                if ( err ) {
                  eachCallback(err);

                } else {
                  if ( ( highestLinkId === null ) || ( link._id > highestLinkId ) ) {
                    highestLinkId = link._id;
                  }
                  eachCallback();
                }
              });

            }, function(err) {
              whilstCallback(err);
            });
          }
        }
      );

    }, function( err ) {
      callback(err);
    });
  }

  var processLink = function( link, userEmail, callback ) {

    if ( ! link ) { callback( winston.makeMissingParamError('link') ); return; }
    if ( ! link.userId ) { callback( winston.makeMissingParamError('link.userId') ); return; }
    if ( ! link.sender ) { callback( winston.makeMissingParamError('link.sender') ); return; }
    if ( ! link.sender.email ) { callback( winston.makeMissingParamError('link.sender.email') ); return; }
    if ( ! userEmail ) { callback( winston.makeMissingParamError('userEmail') ); return; }

    //winston.doInfo('link', {linkId: link._id});

    var userId = link.userId;

    var wasPromoted = false;
    if ( link.isPromoted ) {
      wasPromoted = true;
    }

    var senderEmail = link.sender.email;
    var isSentByUser = false;
    if ( senderEmail == userEmail ) {
      isSentByUser = true;
    }

    contactUtils.getContactData( userId, senderEmail, function(err, senderContactData) {
      if ( err ) {
        callback(err);

      } else if ( ! senderContactData ) {
        callback( winston.makeError('no senderContactData', {userId: userId, senderEmail: senderEmail}) );

      } else {
        var isValid = linkUtils.isValidURL( link.url );
        if ( ! isValid ) {
          link.isPromoted = false;
          link.nonPromotableReason = 'invalid';
        }

        linkUtils.checkAndMarkLinkPromoted( link, senderContactData, isSentByUser, true, function(err) {
          if ( err ) {
            callback(err);

          } else {
            saveLink( link, function( err ) {
              if ( err ) {
                callback( err );

              } else {
                if ( link.isPromoted ) {

                  if ( ! wasPromoted ) {
                    winston.doInfo('promoting unpromoted link', {linkId: link._id, url: link.url});
                  }

                  if ( ! link.linkInfoId ) {
                    linkUtils.getLinkInfoAndUpdateLink( link, callback );

                  } else if ( link.isFollowed && ( ! wasPromoted ) ) {
                    indexingHandler.createIndexingJobForResourceMeta( link, true, callback );

                  } else {
                    callback();
                  }

                } else { //not promoted
                  if ( wasPromoted ) {
                    winston.doInfo('unpromoting link', {linkId: link._id, url: link.url, nonPromotableReason: link.nonPromotableReason});
                    indexingHandler.deleteResourceMetadata( link, true, callback );
                  } else {
                    callback();
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  var saveLink = function( link, callback ) {

    if ( ! link ) { callback( winston.makeMissingParamError('link') ); return; }

    var updateSet = {
        $set: {}
      , $unset: {}
    }

    if ( link.isPromoted ) {
      updateSet['$set']['isPromoted'] = true;
      updateSet['$unset']['nonPromotableReason'] = 1;
    } else {
      updateSet['$unset']['isPromoted'] = 1;
      updateSet['$set']['nonPromotableReason'] = link.nonPromotableReason;
    }

    LinkModel.findOneAndUpdate({_id: link._id}, updateSet, function(err) {
      if ( err ) {
        callback( winston.makeMongoError(err) );

      } else {
        callback();
      }
    });
  }

  var cleanup = function() {
    mongoose.disconnect();
  }

  run( function(err) {
    if ( err ) {
      winston.handleError(err);
    }
    winston.doInfo('done!');
    cleanup();
  });
  
});
