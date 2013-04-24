var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var AttachmentModel = mongoose.model ('Attachment');
var AttachmentMRModel = mongoose.model ('AttachmentMR');
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

    AttachmentMRModel.collection.find({'_id.userId': userId, value : {$gt : 1}}, function (err, cursor) {
      if (err) {
        findDupesCb(winston.makeMongoError (err));
      }
      else {
        cursor.toArray(function(err, attachments) {
          if (err) {
            findDupesCb(winston.makeMongoError (err));
          }
          else {
            console.log (attachments);
            async.each (attachments, 
              function (attachment, asyncCb) {
                deleteDupes (attachment._id.userId, attachment._id.gmThreadId, attachment._id.hash, asyncCb);
              }, 
              function (err) {
                if (err) {
                  findDupesCb (err);
                }
                else {
                  findDupesCb ();
                }
              });

          }
        });
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
            if (dupe.sentDate.getTime() == earliestDate.getTime()) {
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
              console.log (earliestSentDateIds)
              // kill all but one of the duplicates that share sentDate
              if (earliestSentDateIds.length > 1) {

                // remove the last element
                var keepId = earliestSentDateIds.pop();

                winston.doInfo ('multiple id\'s share same sent date', {keep : keepId, toDelete : earliestSentDateIds});

                AttachmentModel.remove ({})
                  .where ('_id').in (earliestSentDateIds)
                  .exec (function (err) {
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
