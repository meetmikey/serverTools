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
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 100;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp( 'findThreadLinkDuplicates', initActions, conf, function() {
  var reported = {}
  var dupes = 0;
  var total = 0;
  // for each user
  UserModel.findById ("517072f3d76a885823000006", function (err, foundUser) {
    // for each promoted link
    LinkModel.find ({userId : foundUser._id, isPromoted : true})
      .limit (limit)
      .select ('gmThreadId comparableURLHash')
      .exec (function (err, links) {
        if (err) {

        } else if (links && links.length) {
          links.forEach ( function (link)  {
            var comparableURLHash = link.comparableURLHash;
            var gmThreadId = link.gmThreadId;

            LinkModel.count ({userId : foundUser._id, gmThreadId : gmThreadId, comparableURLHash : comparableURLHash}, function (err, count) {
              if (count > 1 && !(gmThreadId + "_"  + comparableURLHash in reported)) {
                winston.doInfo('info', {count: count, thread: gmThreadId, comparableURLHash: comparableURLHash});
                reported [gmThreadId + "_" + comparableURLHash] = 1;
                dupes+=1
                total +=1
              } else {
                winston.doInfo('count', {count: count});
                total +=1
              }
            });
          });
        }
      })
    // see if there's a duplicate on the thread

    // if so delete the later sentDate
  });

setInterval (function () {
  var fraction = dupes/total;
  winston.doInfo('fraction', {fraction: fraction});
}, 5000)

});
