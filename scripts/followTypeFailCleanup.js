var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var LinkModel = mongoose.model ('Link');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var limit = 50;

if (process.argv.length > 2) {
  limit = parseInt (process.argv[2]);
  console.log ('limit', limit);
}

/*
{
  "_id" : ObjectId("5146bc154e03984f34a8dae6"),
  "comparableURL" : "www.informationweek.com/thebrainyard/news/email/google-gmail-gets-shared-inboxes/229402464",
  "comparableURLHash" : "32f5ff28b557ef26aaa64b82ab10023c883df5dc3de3ebf53ea5bc1b3d642901",
  "followType" : "fail",
  "lastFollowDate" : ISODate("2013-03-18T07:02:47.260Z"),
  "rawURL" : "http://www.informationweek.com/thebrainyard/news/email/google-gmail-gets-shared-inboxes/229402464",
  "summary" : "Cloud workflow specialist RunMyProcess adds key collaboration feature to help businesses jump from Microsoft Exchange to Google Gmail.\n Cloud workflow specialist RunMyProcess has added a missing collaboration feature to Gmail, one that Microsoft Exchange users often miss if they switch to the Google",
  "title" : "Google Gmail Gets Shared Inboxes - The BrainYard"
}
*/

appInitUtils.initApp( 'followTypeFailCleanup', initActions, conf, function() {

  LinkInfoModel.find ({followType : 'fail', title : {$exists : true}})
    .limit (limit)
    .exec (function (err, linkInfos) {
      if (err) {
        winston.doMongoError (err);
      } else {
 
        linkInfos.forEach (function (linkInfo) {
          // set the followtype to diffbot
          //linkInfo.followType = 'diffbot';
          console.log (linkInfo);
          LinkModel.find ({comparableURLHash : linkInfo.comparableURLHash, isPromoted : false}, 
            function (err, links) {
              if (err) {
                winston.doMongoError (err);
              }
              else {
                if  (links && links.length) {
                  console.log ('links', links[0]);
                }
              }
            });       

          /*
          linkInfo.save (function (err) {
            if (err) {
              winston.doMongoError (err);
            } else {
              // get all links with this hash...
              LinkModel.find ({comparableURLHash : linkInfo.comparableURLHash, isPromoted : false}, 
                function (err, links) {

                  if (err) {
                    winston.doMongoError (err);
                  }
                  else {
                    // promote one of the unpromoted links...
                    var uniqueUsers = {};

                    links.forEach (function (link) {
                      if (!(link.userId in uniqueUsers)) {
                        uniqueUsers[link.userId] = 1;
                      
                        link.isPromoted = true;

                        
                        //link.save (function (err) {
                        //})
                      }
                    });


                  }  
                });
            }
          });*/
      });
    }
  });

});
