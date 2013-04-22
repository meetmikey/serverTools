var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var LinkModel = mongoose.model ('Link');
var UserModel = mongoose.model ('User');

var setIsFollowed = this;

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  console.log ('limit', limit);
}

appInitUtils.initApp( 'setIsFollowed', initActions, conf, function() {

  function doBatchCallback (err, skip) {
    if (err) {
      console.log (err);
    } 
    else if (skip) {
      setIsFollowed.doBatch (skip, doBatchCallback);
    }
  }

  setIsFollowed.doBatch (0, doBatchCallback);

});



exports.doBatch = function (skip, callback) {
  winston.doInfo ('dobatch',  {skip : skip});
  LinkInfoModel.find ({followType : {$ne : 'fail'}, followType : {$exists : true}})
    .limit (limit)
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
          // set the followtype to diffbot
          //linkInfo.followType = 'diffbot';

          LinkModel.update ({comparableURLHash : linkInfo.comparableURLHash},
            {$set : {isFollowed : true}},
            {multi : true},
            function (err, num) {
              if (err) {
                winston.doMongoError (err);
              }
              else if (num == 0) {
                winston.doWarn ('zero link records updated isFollowed for hash', {comparableURLHash : comparableURLHash});
              }

              asyncCb ();
            });
          }
          , function (err) {

            if (numLinkInfos == limit) {
              callback (null, skip + numLinkInfos);
            }
            else {
              callback ();
            }
          });
      }
    });

}