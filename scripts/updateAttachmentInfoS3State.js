var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    s3Utils = require (serverCommon + '/lib/s3Utils'),
    attachmentUtils = require (serverCommon + '/lib/attachmentUtils'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;


var updateAttachmentInfoS3State = this;

var MailModel = mongoose.model ('Mail');
var AttachmentInfoModel = mongoose.model ('AttachmentInfo');
var AttachmentModel = mongoose.model ('Attachment');
var BATCH_SIZE = 500;

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'updateAttachmentInfoS3State', initActions, conf, function() {

  var sum = 0;
  var checkExistsForBatchCallback = function (err, lastUid) {
    if (err) {
      winston.handleError (err);
    } 
    else if (lastUid) {
      console.log ('done with batch', sum += BATCH_SIZE);
      console.log ('lastUid', lastUid);

      updateAttachmentInfoS3State.checkExistsForBatch (lastUid, checkExistsForBatchCallback);
    }
    else {
      console.log ('all done');
    } 
  }

  updateAttachmentInfoS3State.checkExistsForBatch (null, checkExistsForBatchCallback);


});

exports.checkExistsForBatch = function (lastUid, callback) {
  var filter = {};
  if (lastUid) {
    filter['_id'] = {$gt : lastUid};
  }

  AttachmentInfoModel.find (filter)
    .select ('_id hash fileSize isUploaded')
    .limit (BATCH_SIZE)
    .sort ('_id')
    .exec (function (err, attachmentInfos) {
      if (err) {
        callback (winston.makeMongoError (err));
      } 
      else if (!attachmentInfos.length) {
        // nothing left to do.
        callback (null, null);
      }
      else {
        var lastUid = attachmentInfos[attachmentInfos.length-1]._id;

        async.each (attachmentInfos, function (attachmentInfo, asyncCb) {

          if (attachmentInfo.isUploaded) {
            asyncCb ();
            return;
          }

          s3Utils.checkFileExists (conf.aws.s3Folders.attachment + '/' + attachmentUtils.getFileContentId (attachmentInfo), function (err, exists) {
            if (err) {
              winston.doWarn ('error checkfile', {err :err});
              asyncCb ();
            } else if (exists) {

              attachmentInfo.isUploaded = true;
              attachmentInfo.save (function (err) {
                if (err) {
                  asyncCb (winston.makeMongoError (err));                
                } else {
                  asyncCb ();
                }
              });
            
            } else {
              winston.doWarn ('Attachment does not exist in s3', {hash : attachmentInfo.hash, fileSize : attachmentInfo.fileSize});
              
              // the file must not! be in s3, find an attachment, find a mail, mark as softFail
              AttachmentModel.findOne ({hash : attachmentInfo.hash, fileSize : attachmentInfo.fileSize}, function (err, att) {
                if (err) {
                  asyncCb (winston.makeMongoError (err));
                } else if (!att) {
                  winston.doWarn ('AttachmentInfo without attachment', {hash : attachmentInfo.hash, fileSize : attachmentInfo.fileSize});
                  asyncCb ();
                } else {
                  MailModel.findById (att.mailId, function (err, foundMail) {
                    if (err) {
                      asyncCb (winston.makeMongoError (err));

                    } else if (!foundMail) {
                      winston.doWarn ('Could not find mail with id', {_id : att.mailId})
                      asyncCb ();

                    } else {

                      foundMail.mailReaderState = 'softFail'
                      foundMail.save (function (err) {
                        if (err) {
                          asyncCb (winston.makeMongoError (err));
                          return;     
                        } else {
                          winston.doInfo ('updated mail state to softFail', {mailId : att.mailId});
                          asyncCb ();
                        }
                      });
                    }
                  });
                }
              });
            
            }
          });
        }, function (err) {
          if (err) {
            callback (err);
          } else {
            callback (null, lastUid);
          }
        });
      }
  });
}