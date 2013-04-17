var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');
var LinkModel = mongoose.model ('Link');
var AttachmentModel = mongoose.model ('Attachment');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 100;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  console.log ('limit', limit);
}

appInitUtils.initApp( 'findThreadLinkDuplicates', initActions, conf, function() {

  // for each user


  // for each promoted link

  // see if there's a duplicate on the thread

  // if so delete the later sentDate

});