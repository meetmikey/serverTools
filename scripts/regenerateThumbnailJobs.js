var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkInfoModel = mongoose.model ('LinkInfo');
var AttachmentInfoModel = mongoose.model ('AttachmentInfo');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'regenerateThumbnailJobs', initActions, conf, function() {
  conf.turnDebugModeOn();

  var limit = 100;

  if (process.argv.length > 2) {
    limit = parseInt (process.argv[2]);
    winston.doInfo('limit', {limit: limit});
  }

  var attachmentQuery = {
    isImage : true, 
    attachmentThumbExists : {$ne : true},
    attachmentThumbSkip : {$ne : true}
  };

  AttachmentInfoModel.find (attachmentQuery,
    '_id hash fileSize attachmentThumbSkip',
    {limit : limit},
    function (err, attachmentInfos) {
    if (err) {
      winston.doMongoError ('Could not get mail', {err : err});
      return;
    }

    winston.doInfo ('About to send messages to queue', {numMessages : attachmentInfos.length});

    var pushCount = 0;
    attachmentInfos.forEach (function (attachment) {

      if (attachment.attachmentThumbSkip) { return; }

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

      sqsConnect.addMessageToThumbnailQueue (thumbnailJob);

      pushCount+=1;
      winston.doInfo('pushCount', {pushCount: pushCount});

    });
  
  });

});