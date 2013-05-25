var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , userQueueUtils = require('../lib/userQueueUtils')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , prompt = require('prompt')

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'addAllUsersToResumeTable', initActions, conf, function() {
  userQueueUtils.addAllUsersToResumeTable();
});