var serverCommon = process.env.SERVER_COMMON;

var appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , conf = require(serverCommon + '/conf')
  , esConnect = require(serverCommon + '/lib/esConnect')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston

var initActions = [
  appInitUtils.CONNECT_ELASTIC_SEARCH
];

appInitUtils.initApp('checkHealth', initActions, conf, function() {
  esConnect.checkHealth( function(err) {
    if ( err ) {
      winston.handleError( err );
    }
  });
});