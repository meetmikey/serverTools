var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    followLinkUtils = require (serverCommon + '/lib/followLinkUtils'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var LinkModel = mongoose.model ('Link');

var retryFollows = this;

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  console.log ('limit', limit);
}

appInitUtils.initApp( 'retryFollows', initActions, conf, function() {

  function doBatchCallback (err, skip) {
    if (err) {
      console.log (err);
    } 
    else if (skip) {
      retryFollows.doBatch (skip, doBatchCallback);
    } else {
      console.log ('all done');
    }
  }

  retryFollows.doBatch (0, doBatchCallback);

});



exports.doBatch = function (skip, callback) {
  winston.doInfo ('dobatch',  {skip : skip});
  LinkInfoModel.find ({followType : 'fail'})
    .limit (limit)
    .sort ('comparableURLHash')
    .skip (skip)
    .exec (function (err, linkInfos) {
      if (err) {
        winston.doMongoError (err);
      }
      else {
        var numLinkInfos = linkInfos.length;
        winston.doInfo ('requeing linkinfos ', {links : numLinkInfos});

        async.forEach (linkInfos, function (linkInfo, asyncCb) {
          // find random user that has the link
          LinkModel.findOne ({comparableURLHash : linkInfo.comparableURLHash})
            .select ('userId')
            .exec (function (err, link) {
              if (err) {
                asyncCb (winston.makeMongoError (err));
              } else if (!link) {
                asyncCb ();
              } else {
                followLinkUtils.createFollowLinkJob (linkInfo, link.userId);
                asyncCb();
              }
            });
        }, function (err) {
          if (err) {
            callback (err);
          } else {
            if (numLinkInfos == limit) {
              callback (null, numLinkInfos + skip);
            } else {
              callback ();
            }
          }
        });
      }
    });

}