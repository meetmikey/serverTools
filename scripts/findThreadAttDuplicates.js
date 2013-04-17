var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    https = require ('https'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var MailModel = mongoose.model ('Mail');
var LinkModel = mongoose.model ('Link');
var AttachmentModel = mongoose.model ('Attachment');
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
appInitUtils.initApp( 'findThreadAttDuplicates', initActions, conf, function() {
  var reported = {}
  var dupes = 0;
  var total = 0;
  // for each user
  UserModel.findById ("5147afc4f287efc831000005", function (err, foundUser) {
    // for each promoted attachment
    AttachmentModel.find ({userId : foundUser._id})
      .limit (limit)
      .select ('gmThreadId hash')
      .exec (function (err, attachments) {
        if (err) {

        } else if (attachments && attachments.length) {
          attachments.forEach ( function (attachment)  {
            var hash = attachment.hash;
            var gmThreadId = attachment.gmThreadId;

            AttachmentModel.count ({userId : foundUser._id, gmThreadId : gmThreadId, hash : hash}, function (err, count) {
              if (count > 1 && !(gmThreadId + "_"  + hash in reported)) {
                console.log ("count", count);
                console.log ("thread", gmThreadId);
                console.log ("hash", hash);
                reported [gmThreadId + "_" + hash] = 1;
                dupes+=1
                total +=1
              } else {
                console.log (count)
                total +=1
              }
            });
          });
        }
      })
    // see if there's a duplicate on the thread

    // if so delete the later sentDate
  });

setInterval (function () {
  console.log (dupes/total)
}, 5000)

});
*/

appInitUtils.initApp( 'findThreadAttDuplicates', initActions, conf, function() {
  var reported = {}
  var dupes = 0;
  var total = 0;
  // for each user
  UserModel.find ({}, function (err, foundUsers) {

    async.eachSeries (foundUsers, function (user, cb) {
      findDupes (user._id, cb);
    }, 
    function (err) {
      if (err) {
        winston.handleError (err);
      }
    });
  });

  function findDupes (userId, cb) {
    // for each promoted attachment
    AttachmentModel.find ({userId : userId})
      .limit (limit)
      .select ('gmThreadId hash')
      .exec (function (err, attachments) {
        if (err) {
          cb (winston.makeMongoError (err));
        } 
        else if (attachments && attachments.length) {
          attachments.forEach ( function (attachment)  {
            var hash = attachment.hash;
            var gmThreadId = attachment.gmThreadId;

            AttachmentModel.count ({userId : userId, gmThreadId : gmThreadId, hash : hash}, function (err, count) {
              if (err) {
                cb (winston.makeMongoError (err));
              }
              else if (count > 1 && !(gmThreadId + "_"  + hash in reported)) {
                reported [gmThreadId + "_" + hash] = 1;
                dupes+=1
                total +=1
                deleteDupes (userId, gmThreadId, hash, cb);
              } 
              else {
                console.log (count)
                total +=1
              }
            });
          });
        }
      })
  }

  function deleteDupes (userId, gmThreadId, hash, cb) {
    var filter = {userId : userId, gmThreadId : gmThreadId, hash : hash};
    AttachmentModel.find (filter)
      .select ('gmThreadId hash sentDate')
      .exec (function (err, dupes) {

        if (err) {
          cb (winston.makeMongoError (err));
        } else if (dupes && dupes.length) {
          var earliestDate = dupes[0].sentDate;

          dupes.forEach (function (dupe) {
            if (dupe.sentDate < earliestDate) {
              dupe.earliestDate = dupe.sentDate;
            }
          });

          console.log (filter);
          console.log (earliestDate);

          // TODO : actually delete the duplicate
          filter.sentDate = {$ne : earliestDate};
          AttachmentModel.remove (filter, function (err) {
            if (err) {
              cb (winston.makeMongoError (err));
            } else {
              console.log ('delete successful')
            }
          })

        }
      });
  }


  setInterval (function () {
    console.log (dupes/total)
  }, 5000)

});