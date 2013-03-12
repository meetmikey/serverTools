var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , async = require(serverCommon + '/node_modules/async')
  , winston = require (serverCommon + '/lib/winstonWrapper').winston
  , mongoUtils = require(serverCommon + '/lib/mongoUtils')
  , mongoose = require(serverCommon + '/lib/mongooseConnect')
  , AttachmentModel = require(serverCommon + '/schema/attachment').AttachmentModel
  , LinkModel = require(serverCommon + '/schema/link').LinkModel
  , MailModel = require(serverCommon + '/schema/mail').MailModel

var BATCH_SIZE = 100;
var UPDATE_ALL = true;
var SHARD_KEY_FIELD = 'shardKey';

var run = function() {
  async.series([
        function( seriesCallback ) { updateShardKeysForModel( AttachmentModel, 'attachment', 'userId', seriesCallback ); }
      , function( seriesCallback ) { updateShardKeysForModel( LinkModel, 'link', 'userId', seriesCallback ); }
      , function( seriesCallback ) { updateShardKeysForModel( MailModel, 'mail', 'userId', seriesCallback ); }
    ], function(err) {
      if ( err ) {
        winston.handleError( err );
      } else {
        winston.doInfo('Done!');
      }
      mongoose.disconnect();
    }
  );
}

var updateShardKeysForModel = function( model, modelName, inputField, callback ) {

  if ( ! model ) { callback( winston.makeMissingParamError('model') ); return; }
  if ( ! modelName ) { callback( winston.makeMissingParamError('modelName') ); return; }
  if ( ! inputField ) { callback( winston.makeMissingParamError('inputField') ); return; }

  var highestId = 0;
  var totalProcessed = 0;
  doBatch( model, modelName, inputField, highestId, totalProcessed, function( err, newHighestId, newTotalProcessed ) {
    if ( err ) {
      callback(err);

    } else {
      winston.doInfo('Done with model ' + modelName + '!  Total processed: ' + newTotalProcessed);
      callback();
    }
  });
}

var doBatch = function( model, modelName, inputField, highestId, totalProcessed, callback ) {

  if ( ! model ) { callback( winston.makeMissingParamError('model') ); return; }
  if ( ! modelName ) { callback( winston.makeMissingParamError('modelName') ); return; }
  if ( ! inputField ) { callback( winston.makeMissingParamError('inputField') ); return; }

  var newHighestId = highestId;
  var newTotalProcessed = totalProcessed;

  var filter = {};
  if ( ! UPDATE_ALL ) {
    filter['shardKey'] = { $exists: false };
  }
  if ( highestId ) {
    filter['_id'] = { $gt: highestId };
  }

  var selectFields = '_id ' + inputField;

  var query = model.find( filter );
  query.sort( '_id' )
    .limit( BATCH_SIZE )
    .select( selectFields )
    .exec( function( err, foundObjects ) {
      if ( err ) {
        callback( winston.makeMongoError(err) );

      } else if ( ( ! foundObjects ) || ( ! ( foundObjects.length > 0 ) ) ) {
        winston.doInfo('Hit the end for ' + modelName + '!');
        callback( null, newHighestId, newTotalProcessed );

      } else {
        async.each( foundObjects, function(object, eachCallback) {
          updateShardKeyForObject( object, model, inputField, function(err) {
            if ( err ) {
              eachCallback(err);

            } else {
              if ( ( ! highestId ) || ( object._id > newHighestId ) ) {
                newHighestId = object._id;
              }
              newTotalProcessed++;
              eachCallback();
            }
          });

        }, function(err) {
          if ( err ) {
            callback( err );
          } else {
            
            //Hacky: do the timeout-zero thing to avoid a massive recursize callstack.
            setTimeout( function() {
              doBatch( model, modelName, inputField, newHighestId, newTotalProcessed, callback );
            }, 0);
          }
        });
      }
    }
  );
}

var updateShardKeyForObject = function( object, model, inputField, callback ) {
  if ( ! object ) { callback( winston.makeMissingParamError('object') ); return; }
  if ( ! object._id ) { callback( winston.makeMissingParamError('object._id') ); return; }
  if ( ! model ) { callback( winston.makeMissingParamError('model') ); return; }
  if ( ! inputField ) { callback( winston.makeMissingParamError('inputField') ); return; }

  var shardKeyInput = object[ inputField ];
  if ( ! shardKeyInput ) {
    winston.doWarn('Missing shardKey input', {object: object, inputField: inputField});
    callback();
    return;
  }

  var shardKey = mongoUtils.getShardKeyHash( shardKeyInput );
  if ( ! shardKey ) {
    callback( winston.makeError('empty shard key!', {object: object, inputField: inputField, shardKey: shardKey}) );
    return;
  }

  var updateSet = {$set:{}};
  updateSet['$set'][SHARD_KEY_FIELD] = shardKey

  model.findOneAndUpdate({_id : object._id}, updateSet, function(err, updatedObject) {
    if ( err ) {
      callback( winston.makeMongoError(err) );

    } else if ( updatedObject[SHARD_KEY_FIELD] != shardKey ) {
      callback( winston.makeError('shardKey value not set!', {oldObject: object, newObject: updatedObject, shardKey: shardKey}) );
      callback();

    } else {
      callback();
    }
  });
}

run();