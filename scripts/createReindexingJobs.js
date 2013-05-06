var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    indexingHandler = require (serverCommon + '/lib/indexingHandler'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;


var createReindexingJobs = this;

var UserModel = mongoose.model ('User');
var AttachmentModel = mongoose.model ('AttachmentModel');
var LinkModel = mongoose.model ('LinkModel');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'createReindexingJobs', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.makeMongoError (err);
    } else if (foundUsers && foundUsers.length) {

      async.eachSeries (foundUsers, function (user, asyncCb) {
        generateIndexingJobsForUser (user, asyncCb);
      }, function (err) {
        if (err) {
          winston.handleError (err);
        }
        console.log ('all done for all users');
      });
    }
  });

});


exports.requeueJobsForUser = function (user, cb) {
  console.log ('user', user);

  async.parallel([
    function(asyncCb){
      createReindexingJobs.requeueAllAttachmentsForUser (user._id, asyncCb);
    },
    function(asyncCb){
      createReindexingJobs.requeueAllLinksForUser (user._id, asyncCb);
    }
  ],
  // optional callback
  function(err, results){
    if (err) {
      cb (err);
    } else {
      cb ();
    }
  });

}

//TODO : do we need to batch?
exports.requeueAllAttachmentsForUser = function (userId, cb) {
  AttachmentModel.find ({userId : userId, isPromoted : true})
    .select ('_id userId mailId fileSize index hash')
    .exec (function (err, foundAttachments) {
      if (err) {
        cb (winston.makeMongoError (err));
      } else if (foundAttachments) {
        var len = foundAttachments.length;
        var totalCallbacks = 0;
        winston.doInfo ('About to create attachment reindexing jobs for user ', {userId : userId, numAttachments : len});

        foundAttachments.forEach (function (attachment) {

          if (createReindexingJobs.jobAlreadyQueued (attachment)) {
            totalCallbacks++;
            return;
          }

          indexingHandler.createIndexingJobForDocument ( attachment, false, true, function (err) {
            totalCallbacks++;
            if (err) {
              winston.doError ('could not push job to queue for attachment', {err :err, attachmentId : attachment._id}));
            } else if (len == totalCallbacks) {
              cb ();
            }
          });
        });

      }
    });
}

//TODO : do we need to batch?
exports.requeueAllLinksForUser = function (userId, cb) {
  LinkModel.find ({userId : userId, isPromoted : true, isFollowed : true})
    .select ('_id userId mailId comparableURLHash index')
    .exec (function (err, foundLinks) {
      if (err) {
        cb (winston.makeMongoError (err));
      } else if (foundLinks) {
        var len = foundLinks.length;
        var totalCallbacks = 0;
        winston.doInfo ('About to create link reindexing jobs for user ', {userId : userId, numLinks : len});

        foundLinks.forEach (function (link) {
          
          if (createReindexingJobs.jobAlreadyQueued (link)) {
            totalCallbacks++;
            return;
          }

          indexingHandler.createIndexingJobForDocument ( link, false, true, function (err) {
            totalCallbacks++;
            if (err) {
              winston.doError ('could not push job to queue for link', {err :err, linkId : link._id}));
            } else if (len == totalCallbacks) {
              cb ();
            }
          });
        });

      }
    });
}


exports.jobAlreadyQueued = function (link) {
  var currentStateIndex = indexingHandler.getArrayIndexForVersion (link.index, esConnect.indexName);
  return currentStateIndex != -1;
}