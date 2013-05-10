var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    indexingHandler = require (serverCommon + '/lib/indexingHandler'),
    conf = require (serverCommon + '/conf'),
    esConnect = require (serverCommon + '/lib/esConnect'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;


var createReindexingJobs = this;

var UserModel = mongoose.model ('User');
var AttachmentModel = mongoose.model ('Attachment');
var LinkModel = mongoose.model ('Link');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var version = 'v3';

appInitUtils.initApp( 'createReindexingJobs', initActions, conf, function() {

      async.waterfall ([
        function (asyncCb) {
          createReindexingJobs.requeueAttachments (version, asyncCb);
        },
        function (asyncCb) {
          createReindexingJobs.requeueLinks (version, asyncCb);
        },
        function (err) {
          if (err) {
            winston.handleError (err);
          }
          console.log ('all done');
          process.exit (1);
        }]);


});


//TODO : do we need to batch?
exports.requeueAttachments = function (version, cb) {
  AttachmentModel.find ({'index.version' : {$ne : 'v3'}, isPromoted : true})
    .select ('_id userId mailId fileSize index hash')
    .exec (function (err, foundAttachments) {
      if (err) {
        cb (winston.makeMongoError (err));
      } else if (foundAttachments && foundAttachments.length) {
        var len = foundAttachments.length;
        var totalCallbacks = 0;
        winston.doInfo ('About to create attachment reindexing jobs ', {version : version, numAttachments : len});

        foundAttachments.forEach (function (attachment) {

          if (createReindexingJobs.jobAlreadyQueued (attachment)) {
            console.log ('job already queued');
            totalCallbacks++;
          }
          else {

            indexingHandler.createIndexingJobForDocument ( attachment, false, false, function (err) {
              totalCallbacks++;
              if (err) {
                winston.doError ('could not push job to queue for attachment', {err :err, attachmentId : attachment._id});
              } else if (len == totalCallbacks) {
                cb ();
              }
            });
          }
        });
      } else {
        cb ();
      }
    });
}

//TODO : do we need to batch?
exports.requeueLinks = function (version, cb) {
  LinkModel.find ({'index.version' : {$ne : 'v3'}, isPromoted : true, isFollowed : true})
    .select ('_id userId mailId comparableURLHash index')
    .exec (function (err, foundLinks) {
      if (err) {
        cb (winston.makeMongoError (err));
      } else if (foundLinks && foundLinks.length) {
        var len = foundLinks.length;
        var totalCallbacks = 0;
        winston.doInfo ('About to create link reindexing jobs ', {version : version, numLinks : len});

        foundLinks.forEach (function (link) {
          
          if (createReindexingJobs.jobAlreadyQueued (link)) {
            totalCallbacks++;
          }
          else {
            indexingHandler.createIndexingJobForDocument ( link, true, false, function (err) {
              totalCallbacks++;
              if (err) {
                winston.doError ('could not push job to queue for link', {err :err, linkId : link._id});
              } else if (len == totalCallbacks) {
                cb ();
              }
            });
          }
        });

      } else {
        cb ();
      }
    });
}


exports.jobAlreadyQueued = function (attOrLink) {
  var currentStateIndex = indexingHandler.getArrayIndexForVersion (attOrLink.index, esConnect.indexName);
  if (currentStateIndex == -1) {
    winston.doWarn ('index state exists for doc');
  }
  //return currentStateIndex != -1;
  return false;
}