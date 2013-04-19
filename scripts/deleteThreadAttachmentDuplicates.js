var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

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


appInitUtils.initApp( 'deleteThreadAttDuplicates', initActions, conf, function() {
  var reported = {}
  var dupes = 0;
  var total = 0;

  // for each user
  UserModel.find ({}, function (err, foundUsers) {
    async.eachSeries (foundUsers, function (user, cb) {
      winston.doInfo ('expunging duplicates for user', {user : user});
      findDupes (user._id, cb);
    }, 
    function (err) {
      if (err) {
        winston.handleError (err);
      } else {
        console.log ('all done for all users');
      }
    });
  });

  function findDupes (userId, findDupesCb) {
    // for each attachment
    AttachmentModel.find ({userId : userId})
      .limit (limit)
      .select ('gmThreadId hash')
      .exec (function (err, attachments) {
        if (err) {
          findDupesCb (winston.makeMongoError (err));
        } 
        else if (attachments && attachments.length) {

          async.each (attachments, function (attachment, asyncCb)  {
            var hash = attachment.hash;
            var gmThreadId = attachment.gmThreadId;

            AttachmentModel.count ({userId : userId, gmThreadId : gmThreadId, hash : hash}, function (err, count) {
              if (err) {
                asyncCb (winston.makeMongoError (err));
              }
              else if (count > 1 && !(gmThreadId + "_"  + hash in reported)) {
                reported [gmThreadId + "_" + hash] = 1;
                dupes+=1
                total +=1
                deleteDupes (userId, gmThreadId, hash, asyncCb);
              } 
              else {
                console.log (count)
                total +=1
                asyncCb ();
              }
            });

          },
          function (err) {
            if (err) {
              findDupesCb (err);
            } else {
              console.log ('find dupes callback, user complete', userId);
              findDupesCb ();
            }
          });
        }
        else {
          console.log ('find dupes callback, user complete', userId);
          findDupesCb ();
        }
      });
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

          // get all dupes with the same earliest date...
          // we'll need to arbitrarily delete all but one
          var earliestSentDateIds = [];
          dupes.forEach (function (dupe) {
            if (dupe.sentDate == earliestDate) {
              earliestSentDateIds.push (dupe._id);
            }
          });

          // kill everything less than earliest date
          filter.sentDate = {$ne : earliestDate};
          AttachmentModel.remove (filter, function (err) {
            if (err) {
              cb (winston.makeMongoError (err));
            } 
            else {

              // kill all but one of the duplicates that share sentDate
              if (earliestSentDateIds.length > 1) {

                // remove the last element
                var keepId = earliestSentDateIds.pop();

                winston.doInfo ('multiple id\'s share same sent date', {keep : keepId, toDelete : earliestSentDateIds});

                AttachmentModel.remove (earliestSentDateIds, function (err) {
                  if (err) {
                    cb (winston.makeMongoError (err));
                  } 
                  else {
                    winston.doInfo ('delete successful', filter);
                    cb ();
                  }
                });
              
              } 
              else {
                winston.doInfo ('delete successful', filter);
                cb ();
              }  
            }
          });

        }
      });
  }

});