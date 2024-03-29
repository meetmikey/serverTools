var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var LinkModel = mongoose.model ('Link');
var LinkMRModel = mongoose.model ('LinkMr');
var UserModel = mongoose.model ('User');



var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'findThreadLinkDuplicates', initActions, conf, function() {
  var reported = {};

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
        winston.doInfo('all done for all users');
      }
    });
  });


  function findDupes (userId, findDupesCb) {

    LinkMRModel.collection.find({'_id.userId': userId, value : {$gt : 1}}, function (err, cursor) {
      if (err) {
        findDupesCb(winston.makeMongoError (err));
      }
      else {
        cursor.toArray(function(err, links) {
          if (err) {
            findDupesCb(winston.makeMongoError (err));
          }
          else {
            async.each (links, 
              function (link, asyncCb) {
                deleteDupes (link._id.userId, link._id.gmThreadId, link._id.comparableURLHash, asyncCb);
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


  function deleteDupes (userId, gmThreadId, comparableURLHash, cb) {
    var filter = {userId : userId, gmThreadId : gmThreadId, comparableURLHash : comparableURLHash};
    LinkModel.find (filter)
      .select ('gmThreadId comparableURLHash sentDate')
      .exec (function (err, dupes) {

        if (err) {
          cb (winston.makeMongoError (err));
        } else if (dupes && dupes.length) {
          var earliestDate = dupes[0].sentDate;

          dupes.forEach (function (dupe) {
            if (dupe.sentDate.getTime() < earliestDate.getTime()) {
              earliestDate = dupe.sentDate;
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
          LinkModel.remove (filter, function (err) {
            if (err) {
              cb (winston.makeMongoError (err));
            } 
            else {

              // kill all but one of the duplicates that share sentDate
              if (earliestSentDateIds.length > 1) {
                
                // remove the last element (TODO: create a test case i don't trust this)
                var keepId = earliestSentDateIds.pop();

                winston.doInfo ('multiple id\'s share same sent date', {keep : keepId, toDelete : earliestSentDateIds});



                LinkModel.remove ({})
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
