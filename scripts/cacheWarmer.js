var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    constants = require (serverCommon + '/constants'),
    async = require ('async'),
    conf = require (serverCommon + '/conf'),
    memcached = require (serverCommon + '/lib/memcachedConnect'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var cacheWarmer = this;

var AttachmentModel = mongoose.model ('Attachment');
var LinkModel = mongoose.model ('Link');

var initActions = [
  appInitUtils.CONNECT_MONGO,
  appInitUtils.CONNECT_MEMCACHED
];

var batchSize = 1000;
var maxItems = 100000;

if (process.argv.length > 2) {
  batchSize = parseInt (process.argv[2]);
  console.log ('limit', batchSize);
}

appInitUtils.initApp( 'cacheWarmer', initActions, conf, function() {
  async.parallel ([
    cacheWarmer.loadLinks,
    cacheWarmer.loadAttachments
  ], function (err) {
    if (err) {
      winston.handleError (err);
    } else {
      console.log ('all done');
    }
  });

});


exports.loadLinks = function (callback) {
  winston.doInfo ('loadLinks');
  var total = 0;

  function loadBatchCallback (err, lastUid) {
    if (err) {
      callback (err);
    } 
    else if (lastUid) {
      total += batchSize;
      winston.doInfo ('loadBatchCallback links', {total : total});

      if (total < maxItems) {
        cacheWarmer.loadLinkModelBatch (lastUid, loadBatchCallback);
      }
    }
    else {
      callback();
    }
  }

  cacheWarmer.loadLinkModelBatch (null, loadBatchCallback);

}

exports.loadAttachments = function (callback) {
  winston.doInfo ('loadAttachments');

  var total = 0;

  function loadBatchCallback (err, lastUid) {
    if (err) {
      callback (err);
    } 
    else if (lastUid) {
      winston.doInfo ('loadBatchCallback attachment', {total : total});

      total += batchSize;

      if (total < maxItems) {
        cacheWarmer.loadAttachmentModelBatch (lastUid, loadBatchCallback);
      }
    }
    else {
      callback();
    }
  }

  cacheWarmer.loadAttachmentModelBatch (null, loadBatchCallback);

}

exports.loadLinkModelBatch = function (lastUid, callback) {
  winston.doInfo ('loadLinkModelBatch', {lastUid : lastUid});

  var filter = {}

  if (lastUid) {
    filter['_id'] = {$gt : lastUid};
  }

  LinkModel.find (filter)
    .select (constants.DEFAULT_FIELDS_LINK)
    .limit (batchSize)
    .sort ('_id')
    .exec (function (err, links) {
    if (err) {
      callback (winston.makeMongoError (err));
    } else if (links && links.length) {

      // get the last uid
      var lastUid = links[links.length-1]._id;

      memcached.setBatch (links, function (err) {
        if (err) {
          callback (winston.makeError ('error memcached set', {err : err}));
        } else {
          callback (null, lastUid);
        }
      });
    } else {
      callback ();
    }
  });
}

exports.loadAttachmentModelBatch = function (lastUid, callback) {
  winston.doInfo ('loadAttachmentModelBatch', {lastUid : lastUid});
  var filter = {}

  if (lastUid) {
    filter['_id'] = {$gt : lastUid};
  }

  var query = AttachmentModel.find (filter)

  query.select (constants.DEFAULT_FIELDS_Attachment)
    .limit (batchSize)
    .sort ('_id')

  query.exec (function (err, attachments) {
    if (err) {
      callback (winston.makeMongoError (err));
    } else if (attachments && attachments.length) {
      // get the last uid
      var lastUid = attachments[attachments.length-1]._id;

      memcached.setBatch (attachments, function (err) {
        if (err) {
          callback (winston.makeError ('error memcached set', {err : err}));
        } else {
          callback (null, lastUid);
        }
      });
    } else {
      callback ();
    }
  });
}