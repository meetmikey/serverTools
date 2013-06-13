var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    constants = require (serverCommon + '/constants'),
    async = require ('async'),
    _ = require ('underscore'),
    conf = require (serverCommon + '/conf'),
    memcached = require (serverCommon + '/lib/memcachedConnect'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var cacheWarmer = this;

var AttachmentModel = mongoose.model ('Attachment');
var LinkModel = mongoose.model ('Link');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO,
  appInitUtils.CONNECT_MEMCACHED
];

var batchSize = 1000;
var maxItems = 10000;

if (process.argv.length > 2) {
  batchSize = parseInt (process.argv[2]);
  winston.doInfo('batchSize limit', {batchSize: batchSize});
}

appInitUtils.initApp( 'cacheWarmer', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else {
      async.eachSeries (foundUsers, function (foundUser, asyncCb) {

        async.parallel ([
          function (parallelCb) {
            cacheWarmer.loadLinks (foundUser._id, parallelCb);
          },
          function (parallelCb) {
            cacheWarmer.loadAttachments (foundUser._id, parallelCb);
          }
        ], function (err) {
          if (err) {
            winston.handleError (err);
          } else {
            winston.doInfo('all done for user ' + {foundUserId: foundUser._id});
            asyncCb ();
          }
        });

      }, function (err) {
        if (err) {
          winston.handleError (err)
        } else {
          winston.doInfo('all done for all users');
        }
      });
    }
  })

});


exports.loadLinks = function (userId, callback) {
  winston.doInfo ('loadLinks');
  var total = 0;

  function loadBatchCallback (err, lastSent) {
    if (err) {
      callback (err);
    } 
    else if (lastSent) {
      total += batchSize;
      winston.doInfo ('loadBatchCallback links', {total : total});

      if (total < maxItems) {
        cacheWarmer.loadLinkModelBatchForUser (lastSent, userId, loadBatchCallback);
      } else {
        winston.doInfo('over max items limit');
        callback ();
      }
    }
    else {
      callback();
    }
  }

  cacheWarmer.loadLinkModelBatchForUser (null, userId, loadBatchCallback);

}

exports.loadAttachments = function (userId, callback) {
  winston.doInfo ('loadAttachments');

  var total = 0;

  function loadBatchCallback (err, lastSent) {
    if (err) {
      callback (err);
    } 
    else if (lastSent) {
      winston.doInfo ('loadBatchCallback attachment', {total : total});

      total += batchSize;

      if (total < maxItems) {
        cacheWarmer.loadAttachmentModelBatchForUser (lastSent, userId, loadBatchCallback);
      } else {
        winston.doInfo('over max items limit');
        callback ();
      }
    }
    else {
      callback();
    }
  }

  cacheWarmer.loadAttachmentModelBatchForUser (null, userId, loadBatchCallback);

}

exports.loadLinkModelBatchForUser = function (lastSent, userId, callback) {
  winston.doInfo ('loadLinkModelBatch', {lastSent : lastSent});

  var filter = {userId : userId, isPromoted : true, isFollowed : true, isDeleted: false};

  if (lastSent) {
    filter['sentDate'] = {$lt : lastSent};
  }

  LinkModel.find (filter)
    .select (constants.DEFAULT_FIELDS_LINK)
    .limit (batchSize)
    .sort ('-sentDate')
    .exec (function (err, links) {
    if (err) {
      callback (winston.makeMongoError (err));
    } else if (links && links.length) {

      var linksToCache = _.filter(links, function(link) { return (link.isPromoted && link.isFollowed); });

      // get the last uid
      var lastSent = links[links.length-1].sentDate;
      winston.doInfo('lastSent', {lastSent: lastSent});

      memcached.setBatch (linksToCache, function (err) {
        if (err) {
          callback (winston.makeError ('error memcached set', {err : err}));
        } else {
          callback (null, lastSent);
        }
      });
    } else {
      callback ();
    }
  });
}

exports.loadAttachmentModelBatchForUser = function (lastSent, userId, callback) {
  winston.doInfo ('loadAttachmentModelBatch', {lastSent : lastSent});
  var filter = {userId : userId, isPromoted : true};

  if (lastSent) {
    filter['sentDate'] = {$lt : lastSent};
  }

  var query = AttachmentModel.find (filter)

  query.select (constants.DEFAULT_FIELDS_Attachment)
    .limit (batchSize)
    .sort ('-sentDate')

  query.exec (function (err, attachments) {
    if (err) {
      callback (winston.makeMongoError (err));
    } else if (attachments && attachments.length) {

      var attachmentsToCache = _.filter(attachments, function(link){ return (attachments.isPromoted) });

      // get the last uid
      var lastSent = attachments[attachments.length-1].sentDate;
      winston.doInfo('lastSent', {lastSent: lastSent});

      memcached.setBatch (attachments, function (err) {
        if (err) {
          callback (winston.makeError ('error memcached set', {err : err}));
        } else {
          callback (null, lastSent);
        }
      });
    } else {
      callback ();
    }
  });
}