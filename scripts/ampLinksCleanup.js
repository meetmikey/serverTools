var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    urlUtils = require (serverCommon + '/lib/urlUtils'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var LinkModel = mongoose.model ('Link');

var ampLinksCleanup = this;

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  winston.doInfo('limit', {limit: limit});
}

appInitUtils.initApp('ampLinksCleanup', initActions, conf, function() {

  function doBatchCallback (err, skip) {
    if (err) {
      winston.handleError (err);
    } 
    else if (skip) {
      ampLinksCleanup.doBatch (skip, doBatchCallback);
    }
  }

  ampLinksCleanup.doBatch (0, doBatchCallback);

});



exports.doBatch = function (skip, callback) {
  winston.doInfo ('dobatch',  {skip : skip});
  LinkInfoModel.find ({followType : 'fail', rawURL : /&amp/})
    .limit (limit)
    .skip (skip)
    .select ('comparableURLHash rawURL comparableURL _id')
    .exec (function (err, linkInfos) {
      if (err) {
        callback(winston.makeMongoError (err));
      }
      else {

        var numLinkInfos = linkInfos.length;
        winston.doInfo ('fixing links and linkinfos ', {links : numLinkInfos});

        async.eachSeries (linkInfos, function (linkInfo, asyncCb) {

          // clean the linkInfo url
          linkInfo.rawURL = urlUtils.cleanURL (linkInfo.rawURL);

          // clean the linkInfo comparableURL
          linkInfo.comparableURL = urlUtils.cleanURL (linkInfo.comparableURL);

          var oldComparableURLHash = linkInfo.comparableURLHash;

          // compute the comparableURLHash
          linkInfo.comparableURLHash = urlUtils.getComparableURLHash (linkInfo.comparableURL); 

          // save the linkInfo
          linkInfo.save (function (err) {

            // for all links that match the oldComparableURLHash, update the url...
            LinkModel.update ({comparableURLHash : oldComparableURLHash},
              {$set : {url : linkInfo.rawURL}},
              {multi : true},
              function (err, num) {
                if (err) {
                  asyncCb (winston.makeMongoError (err));
                } else if (num == 0) {
                  winston.doWarn ('zero link records updated isFollowed for hash', {comparableURLHash : linkInfo.comparableURLHash});
                  asyncCb ();
                } else {
                  winston.doInfo ('records affected', {num : num});

                  LinkModel.findOne ({comparableURLHash : comparableURLHash}, function (err, link) {
                    if (err) {
                      asyncCb (winston.makeMongoError (err));
                    } else {
                      // create a queue job to follow this linkInfo
                      followLinkUtils.createFollowLinkJob ( linkInfo, link.userId )
                      asyncCb ();
                    }
                  });
                }

              });

          });
        }, function (err) {
          if (err) {
            callback (err);
          }
        });
      }
    });

}