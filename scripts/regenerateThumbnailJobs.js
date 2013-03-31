var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var AttachmentModel = mongoose.model ('Attachment');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'regenerateThumbnailJobs', initActions, conf, function() {

  var limit = 100;

  if (process.argv.length > 2) {
    limit = parseInt (process.argv[2]);
    console.log ('limit', limit);
  }

  // TODO : add some indexes
  var linkInfoQuery = {
    image : {$exists : true}, 
    imageThumbExists : {$exists : false}
  };

  LinkInfoModel.find (linkInfoQuery,
    '_id comparableURLHash image',
    {limit : limit},
    function (err, linkInfos) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
    }
    else if (linkInfos) {

      winston.doInfo ('About to send messages to queue', {numMessages : linkInfos.length});

      linkInfos.forEach (function (linkInfo) {

        // make job to generate thumbnail
        var thumbnailJob = {
          comparableURLHash : linkInfo.comparableURLHash,
          cloudPath : linkInfo.image,
          isRollover : true,
          resourceId : linkInfo._id,
          jobType : 'thumbnail',
          modelName : 'LinkInfo'
        }

        sqsConnect.addMessageToWorkerQueue (thumbnailJob);

      });
    }
  });

  var attachmentQuery = {
    isImage : true, 
    isPromoted : true,
    attachmentThumbExists : {$exists : false}, 
    attachmentThumbSkip : {$ne : false}
  };

  AttachmentModel.find (attachmentQuery,
    '_id hash fileSize',
    {limit : limit},
    function (err, attachments) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
      return;
    }

    winston.doInfo ('About to send messages to queue', {numMessages : attachments.length});
    var done = {};

    attachments.forEach (function (attachment) {

      if (attachment.hash in done) {
        return;
      }

      var cloudPath = cloudStorageUtils.getAttachmentPath (attachment);

      var thumbnailJob = {
        cloudPath : cloudPath,
        isRollover : false,
        resourceId : attachment._id,
        hash : attachment.hash,
        fileSize : attachment.fileSize,
        jobType : 'thumbnail',
        modelName : 'Attachment'
      };

      sqsConnect.addMessageToWorkerQueue (thumbnailJob);

      done [attachment.hash] = 1;

    });
  
  });

});