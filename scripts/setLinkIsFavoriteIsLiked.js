var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , LinkModel = require(serverCommon + '/schema/link').LinkModel

var initActions = [
  appInitUtils.CONNECT_MONGO
];

conf.turnDebugModeOn();

appInitUtils.initApp( 'setLinkIsFavoriteIsLiked', initActions, conf, function() {

  var setLinkIsFavoriteIsLiked = {
    
      BATCH_SIZE: 500
    , finalCallback: null
    , totalSet: 0

    , run: function( callback ) {
        setLinkIsFavoriteIsLiked.finalCallback = callback;
        setTimeout( function() {
          var lowestId = null;
          setLinkIsFavoriteIsLiked.updateNextSet( lowestId, setLinkIsFavoriteIsLiked.checkUpdateNextSetResult );
        }, 0);
      }

    , checkUpdateNextSetResult: function( err, newLowestId, isDone ) {
        if ( err ) {
          callback(err);

        } else if ( isDone ) {
          setLinkIsFavoriteIsLiked.finalCallback()

        } else {
          setTimeout( setLinkIsFavoriteIsLiked.updateNextSet( newLowestId, setLinkIsFavoriteIsLiked.checkUpdateNextSetResult ), 0 );
        }
      }

    , updateNextSet: function( lowestId, callback ) {

        setLinkIsFavoriteIsLiked.getNewHighestId( lowestId, function( err, newHighestId, isDone ) {
          if ( err ) {
            callback( err );

          } else if ( isDone ) {
            callback( null, null, true );

          } else if ( ! newHighestId ) {
            callback( winston.makeError('no newHighestId!', {lowestId: lowestId}) );

          } else {
            highestId = newHighestId;

            var filter = {}
            if ( lowestId ) {
              filter['_id'] = {$gt: lowestId, $lte: highestId};
            } else {
              filter['_id'] = {$lte: highestId};
            }

            var updateData = {$set:{
                isFavorite: false
              , isLiked: false
            }};

            var options = {
              multi: true
            };

            LinkModel.update( filter, updateData, options, function(mongoErr, numAffected) {
              if ( mongoErr ) {
                callback( winston.makeMongoErr(mongoErr) );

              } else {
                setLinkIsFavoriteIsLiked.totalSet += numAffected;
                winston.doInfo('finished batch', {highestId: highestId, totalSet: setLinkIsFavoriteIsLiked.totalSet});
                callback( null, newHighestId, false );
              }
            }); 
          }
        });
      }

    , getNewHighestId: function( lowestId, callback ) {
        var filter = {}
        if ( lowestId ) {
          filter['_id'] = {$gt: lowestId};
        }

        var query = LinkModel.find( filter )
        
        query.sort( '_id' )
          .limit( setLinkIsFavoriteIsLiked.BATCH_SIZE )
          .select( '_id' )
          .exec( function(mongoErr, foundLinks) {
            if ( mongoErr ) {
              callback( winston.makeMongoError( mongoErr ) );

            } else if ( ( ! foundLinks ) || ( foundLinks.length == 0 ) ) {
              callback( null, null, true );

            } else {
              var newHighestId = foundLinks[ foundLinks.length - 1 ]._id;
              callback( null, newHighestId, false );
            }
          }
        );
      }

    , finish: function(err) {
        if ( err ) {
          winston.handleError( err );
        }
        mongoose.disconnect();
      }
  }

  //Do it.
  setLinkIsFavoriteIsLiked.run( setLinkIsFavoriteIsLiked.finish );
});