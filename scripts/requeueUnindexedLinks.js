var serverCommon = process.env.SERVER_COMMON;

var winston = require (serverCommon + '/lib/winstonWrapper').winston,
    appInitUtils = require (serverCommon + '/lib/appInitUtils'),
    conf = require (serverCommon + '/conf'),
    async = require ('async'),
    mongoose = require (serverCommon + '/lib/mongooseConnect').mongoose,
    indexingHandler = require (serverCommon + '/lib/indexingHandler');

var LinkModel = mongoose.model ('Link');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'requeueUnindexedLinks', initActions, conf, function() {

  // for each user
  UserModel.find ({}, function (err, foundUsers) {
    async.eachSeries (foundUsers, function (user, cb) {
      winston.doInfo ('requeue links for user', {user : user});

      findLinks (user._id, cb);
    }, 
    function (err) {
      if (err) {
        winston.handleError (err);
      } else {
        console.log ('all done for all users');
      }
    });
  });


  function findLinks (userId, cb) {

    var dateTime = 1366761600000;

    var query = {
      'userId': userId, 
      isPromoted : true, 
      isFollowed : true, 
      timestamp : {$gt : new Date (dateTime).toISOString()}, 
      $where : 'this.index.length === 0' 
    };

    console.log (query);

    LinkModel.find(query)
      .exec (function (err, foundLinks) {
        if (err) {
          cb (err);
        } else {
          console.log ('about to requeue x links where x=', foundLinks.length);

          async.each (foundLinks, function (link, asyncCb) {
            indexingHandler.createIndexingJobForResourceMeta (link, true, asyncCb);
          }, function (err) {
            cb (err)
          });
        }
      })

  }


});
