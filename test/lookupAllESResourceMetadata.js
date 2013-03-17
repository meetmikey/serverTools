var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , esConnect = require(serverCommon + '/lib/esConnect')
  , prompt = require('prompt')

var initActions = [
    appInitUtils.CONNECT_ELASTIC_SEARCH
];

appInitUtils.initApp( 'lookupAllESResourceMetadata', initActions, conf, function() {

  var query = { "match_all" : { } };

  esConnect.getClient().search( conf.elasticSearch.indexAlias, 'resourceMeta', query )
    .on('data', function(data) {
      winston.doInfo('ES data!', {data: data});
    })
    .on('error', function(error) {
      winston.doError('ES error', {esError: error})
    })
    .exec();

});