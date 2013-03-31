var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var AttachmentModel = mongoose.model ('Attachment');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'regenerateThumbnailJobs', initActions, conf, function() {

  // TODO : add some indexes

  var linkInfoQuery = {
    image : {$exists : true}, 
    imageThumbExists : {$exists : false}
  };

  LinkInfoModel.find (linkInfoQuery,
    '_id comparableURLHash image',
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
    image : {$exists : true}, 
    imageThumbExists : {$exists : false}, 
    imageThumbSkip : {$ne : false}
  };

  AttachmentModel.find (attachmentQuery,
    '_id image',
    function (err, attachments) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
      return;
    }

    winston.doInfo ('About to send messages to queue', {numMessages : attachments.length});

    attachments.forEach (function (attachment) {

      var thumbnailJob = {
        cloudPath : attachment.image,
        isRollover : false,
        resourceId : attachment._id,
        jobType : 'thumbnail',
        modelName : 'Attachment'
      };

      sqsConnect.addMessageToWorkerQueue (thumbnailJob);

    });
  
  });

});