var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    attachmentUtils = require (serverCommon + '/lib/attachmentUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var AttachmentModel = mongoose.model ('Attachment');
var AttachmentInfoModel = mongoose.model ('AttachmentInfo');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

var batchSize = 10;

if (process.argv.length > 2) {
  batchSize = parseInt (process.argv[2]);
  console.log ('limit', batchSize);
}

var alreadyProcessed = {};

appInitUtils.initApp( 'createAttachmentInfo', initActions, conf, function() {

  var count = 0;

  function processBatch (skip, cb) {

    AttachmentModel.find ({})
      .sort ('hash')
      .skip (skip)
      .select ('contentType fileSize attachmentThumbExists attachmentThumbSkip attachmentThumbErr docType hash')
      .limit (batchSize)
      .exec(function (err, foundAttachments) {
        if (err) {
          winston.doMongoError ('Could not get attachments', {err : err});
        }
        else if (foundAttachments) {
          foundAttachments.forEach (function (attachment) { 
            var fileKey = attachmentUtils.getFileContentId (attachment);
            
            if (!(fileKey in alreadyProcessed)) {
              alreadyProcessed [fileKey] = 1;

              var attachmentInfo = new AttachmentInfoModel ({
                contentType : attachment.contentType
                , fileSize : attachment.fileSize
                , isImage : attachment.isImage
                , attachmentThumbExists : attachment.attachmentThumbExists
                , attachmentThumbSkip : attachment.attachmentThumbSkip
                , attachmentThumbErr : attachment.attachmentThumbErr
                , docType : attachment.docType
                , hash : attachment.hash
              });

              attachmentInfo.save (function (err) {
                count+=1;
                console.log ('saved attachmentInfo', count)
                if (err) {
                  winston.doMongoError (err);
                }
              });

            }
          });

          if (foundAttachments.length == batchSize) {
            cb(null, batchSize + skip);
          } else {
            cb (null);
          }
        }
      });  
  }

  var processBatchCallback  = function (err, newIndex) {
    if (err) {
      winston.doMongoError (err);
    } else if (newIndex) {
      processBatch (newIndex, processBatchCallback);
    } else {
      console.log ('all done');
    }
  }

  processBatch (0, processBatchCallback);

});