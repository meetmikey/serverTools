var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , deleteUserUtils = require('../lib/deleteUserUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
  , appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'deleteATTAttachments', initActions, conf, function() {

  var deleteATTAttachments = {
    
    run: function( callback ) {

      var filter = {
        filename: /ATT[\d]{1,6}[\.]{1,2}txt/i
      }
      deleteUserUtils.deleteAttachments(filter, callback);
    }

    , finish: function( err ) {
      if ( err ) {
        winston.handleError( err );
      }
      mongoose.disconnect();
      winston.doInfo('Done!');
    }
  }

  //Do it.
  deleteATTAttachments.run( deleteATTAttachments.finish );
});