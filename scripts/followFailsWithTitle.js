var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var LinkModel = mongoose.model ('Link');

var followFailsWithTitle = this;

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp( 'followFailsWithTitle', initActions, conf, function() {

  function doBatchCallback (err, skip) {
    if (err) {
      winston.doError('error', {err: err});
    } 
    else if (skip) {
      followFailsWithTitle.doBatch (skip, doBatchCallback);
    }
  }

  followFailsWithTitle.doBatch (0, doBatchCallback);

});



exports.doBatch = function (skip, callback) {
  winston.doInfo ('dobatch',  {skip : skip});
  LinkInfoModel.find ({followType : 'fail', title : {$exists : true}})
    .limit (limit)
    .select ('comparableURLHash')
    .sort ('comparableURLHash')
    .skip (skip)
    .exec (function (err, linkInfos) {
      if (err) {
        winston.doMongoError (err);
      }
      else {
        var numLinkInfos = linkInfos.length;
        winston.doInfo ('setting is followed for ', {links : numLinkInfos});

        async.each (linkInfos, function (linkInfo, asyncCb) {
          winston.doInfo('comparableURLHash', {comparableURLHash: linkInfo.comparableURLHash});

          LinkModel.update ({comparableURLHash : linkInfo.comparableURLHash},
            {$set : {isFollowed : true}},
            {multi : true},
            function (err, num) {
              if (err) {
                asyncCb (winston.makeMongoError (err));
                return;
              }
              else if (num == 0) {
                winston.doWarn ('zero link records updated isFollowed for hash', {comparableURLHash : linkInfo.comparableURLHash});
              }
              else {
                winston.doInfo ('records affected', {num : num});
              }

              linkInfo.followType = 'diffbot';

              linkInfo.save (function (err) {
                if (err) {
                  asyncCb (err);
                } else {
                  asyncCb ();
                }
              });
            
            });
          }
          , function (err) {

            if (err) {
              callback (err)
            } else if (numLinkInfos == limit) {
              callback (null, skip + numLinkInfos);
            } else {
              callback ();
            }
          });
      }
    });

}