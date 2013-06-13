var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    sqsConnect = require (serverCommon + '/lib/sqsConnect'),
    cloudStorageUtils = require (serverCommon + '/lib/cloudStorageUtils'),
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose;

var UserModel = mongoose.model ('User');
var MailModel = mongoose.model ('Mail');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'updateUserMailTimestamps', initActions, conf, function() {

  UserModel.find ({}, function (err, foundUsers) {
    if (err) {
      winston.doMongoError (err);
    } else if (foundUsers && foundUsers.length) {
      var len = foundUsers.length;
      var totalCallbacks = 0;

      async.eachSeries (foundUsers, function (user, cb) {

        async.parallel ([
          function (parallelCb) {
            var queryMR = MailModel.find({userId : user._id, mmDone : true, mailReaderState : 'done'});
            queryMR.sort ({gmDate : 1});
            queryMR.limit (1);
            queryMR.exec (function (err, minMR) {
              if (err) {
                parallelCb (winston.makeMongoError (err));
              } else {
                if (minMR && minMR.length) {
                  parallelCb (null, minMR[0].gmDate);
                } else {
                  parallelCb ();
                } 
              }
            })
          },
          function (parallelCb) {
            var queryTot = MailModel.find ({userId : user._id})
            queryTot.sort ({uid : 1})
            queryTot.limit (1);
            queryTot.exec (function (err, minTot) {
              if (err) {
                parallelCb (winston.makeMongoError (err));
              } else {
                if (minTot && minTot.length) {
                  parallelCb (null, minTot[0].gmDate);
                } else {
                  parallelCb ();
                }
              }
            });
          },
          function (parallelCb) {
            var queryMM = MailModel.find ({userId : user._id, mmDone : true});
            queryMM.sort ({gmDate : 1});
            queryMM.limit (1);
            queryMM.exec (function (err, minMM) {
              if (err) {
                parallelCb (winston.makeMongoError (err));
              } else {
                  if (minMM && minMM.length) {
                    parallelCb (null, minMM[0].gmDate);
                  } else {
                    parallelCb ();
                  }
              }
            });
          }],
          function (err, values) {

            console.log (values)

            var mrDate = values[0];
            var totDate = values[1];
            var mmDate = values[2];
          
            if (mmDate) {
              user.minProcessedDate = mmDate; // the date of the earliest mail we've processed (according to mikeymail)
            }

            if (mrDate) {
              user.minMRProcessedDate = mrDate; // the date of the earliest mail that has been processed (according to mailreader)
            }

            if (totDate) {
              user.minMailDate = totDate; // the date of the earliest mail in the gmail account
            }

            user.save (function (err) {
              if (err) {
                cb (winston.makeMongoError (err));
              } else {
                cb ();
              }
            });

          });


      }, function (err) {
        if (err) {
          winston.handleError (err);
        }
        winston.doInfo('all done');
      });
    }
  });

});