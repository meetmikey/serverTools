var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , esConnect = require(serverCommon + '/lib/esConnect')
  , esUtils = require(serverCommon + '/lib/esUtils')
  , prompt = require('prompt')

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
];

appInitUtils.initApp( 'deleteLinkFromESIndex', initActions, conf, function() {

  var linkId = '514524d786f18ced5c000040';
  var comparableURLHash = '6974341663cae8c4a19196e38f6c7dfae546d06c6e4b565b138e6eeaf826a26f';

  esUtils.delete( esConnect.indexName, 'resourceMeta', String(linkId), String(comparableURLHash), function( esUtilsError ) {
    if ( esUtilsError ) {
      winston.doError('esUtilsError', {esUtilsError: esUtilsError});

    } else {
      winston.doInfo('success!');
    }
  });
});