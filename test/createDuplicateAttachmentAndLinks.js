var serverCommon = process.env.SERVER_COMMON;

var conf = require(serverCommon + '/conf')
  , appInitUtils = require(serverCommon + '/lib/appInitUtils')
  , winston = require(serverCommon + '/lib/winstonWrapper').winston
  , mongoose = require(serverCommon + '/lib/mongooseConnect').mongoose
  , esConnect = require(serverCommon + '/lib/esConnect')
  , esUtils = require(serverCommon + '/lib/esUtils')
  , prompt = require('prompt')

var LinkModel = mongoose.model ('Link');
var AttachmentModel = mongoose.model ('Attachment');
var UserModel = mongoose.model ('User');

var initActions = [
  appInitUtils.CONNECT_MONGO
];

appInitUtils.initApp( 'createDuplicateAttachmentAndLinks', initActions, conf, function() {

  var user = new UserModel ({
    "_id" : "5177016b738218636f00000a",
    "email" : "sagar@mikeyteam.com"
  })

  user.save (function (err) {
    if (err) {
      console.error (err);
    }
  });



   att2 = new AttachmentModel ({
    "__v" : 1,
    "attachmentThumbExists" : true,
    "contentType" : "image/png",
    "docType" : "image",
    "fileSize" : 258498,
    "filename" : "image.png",
    "gmMsgHex" : "13dd66761607820f",
    "gmMsgId" : "1431412913935450639",
    "gmThreadId" : "1431412913935450639",
    "hash" : "e8c5b8877ccc7dc5ba59d2923e6a68cdcb3aa4a5f666e8f2ffa6d50dfe0aa8e0",
    "isImage" : true,
    "isPromoted" : true,
    "mailCleanSubject" : "ATTACHMENT TO DELETE",
    "mailId" : "51770175bdcc7f2e6f001670",
    "recipients" : [
      {
        "name" : "community@startx.stanford.edu",
        "email" : "community@startx.stanford.edu"
      }
    ],
    "sender" : {
      "name" : "Andrew Lockhart",
      "email" : "andrewjameslockhart@gmail.com"
    },
    "sentDate" : "2013-04-04T19:55:31Z",
    "timestamp" : "2013-04-23T21:51:15.310Z",
    "userId" : "5177016b738218636f00000a"
  });

  var att1 = new AttachmentModel ({
    "__v" : 1,
    "attachmentThumbExists" : true,
    "contentType" : "image/png",
    "docType" : "image",
    "fileSize" : 258498,
    "filename" : "image.png",
    "gmMsgHex" : "13dd66761607820f",
    "gmMsgId" : "1431412913935450639",
    "gmThreadId" : "1431412913935450639",
    "hash" : "e8c5b8877ccc7dc5ba59d2923e6a68cdcb3aa4a5f666e8f2ffa6d50dfe0aa8e0",
    "isImage" : true,
    "isPromoted" : true,
    "mailCleanSubject" : "POTENTIAL ATTACHMENT TO KEEP",
    "mailId" : "51770175bdcc7f2e6f001670",
    "recipients" : [
      {
        "name" : "community@startx.stanford.edu",
        "email" : "community@startx.stanford.edu"
      }
    ],
    "sender" : {
      "name" : "Andrew Lockhart",
      "email" : "andrewjameslockhart@gmail.com"
    },
    "sentDate" : "2013-04-04T18:55:31Z",
    "timestamp" : "2013-04-23T21:51:15.310Z",
    "userId" : "5177016b738218636f00000a"
  });

  var att3 = new AttachmentModel ({
    "__v" : 1,
    "attachmentThumbExists" : true,
    "contentType" : "image/png",
    "docType" : "image",
    "fileSize" : 258498,
    "filename" : "image.png",
    "gmMsgHex" : "13dd66761607820f",
    "gmMsgId" : "1431412913935450639",
    "gmThreadId" : "1431412913935450639",
    "hash" : "e8c5b8877ccc7dc5ba59d2923e6a68cdcb3aa4a5f666e8f2ffa6d50dfe0aa8e0",
    "isImage" : true,
    "isPromoted" : true,
    "mailCleanSubject" : "POTENTIAL ATTACHMENT TO KEEP 2",
    "mailId" : "51770175bdcc7f2e6f001670",
    "recipients" : [
      {
        "name" : "community@startx.stanford.edu",
        "email" : "community@startx.stanford.edu"
      }
    ],
    "sender" : {
      "name" : "Andrew Lockhart",
      "email" : "andrewjameslockhart@gmail.com"
    },
    "sentDate" : "2013-04-04T18:55:31Z",
    "timestamp" : "2013-04-23T21:51:15.310Z",
    "userId" : "5177016b738218636f00000a"
  });

  att1.save (function (err) {
    if (err) {
      console.error (err);
    }
  })

  att2.save (function (err) {
    if (err) {
      console.error (err);
    }
  })

  att3.save (function (err) {
    if (err) {
      console.error (err);
    }
  })

  var link1 = new LinkModel ({
    "__v" : 0,
    "comparableURLHash" : "bbe593a37fcb05d66a0a07ea078a3e1530649ec997191984e5aa0644b55bf95b",
    "gmMsgHex" : "13d78c1adac538b7",
    "gmMsgId" : "1429765453680818359",
    "gmThreadId" : "1429765453680818359",
    "isPromoted" : false,
    "mailCleanSubject" : "Daily Rollup",
    "mailId" : "5146bef4caa56d9f52044356",
    "nonPromotableReason" : "sender",
    "recipients" : [
      {
        "name" : "andrewjameslockhart@gmail.com",
        "email" : "andrewjameslockhart@gmail.com"
      }
    ],
    "resolvedURL" : "https://www.dropbox.com/",
    "sender" : {
      "name" : "Unrollme",
      "email" : "rollup@unroll.me"
    },
    "sentDate" : "2013-03-17T14:29:51Z",
    "shardKey" : "f7bee",
    "timestamp" : "2013-03-18T07:17:22.713Z",
    "title" : "Dropbox",
    "url" : "http://Dropbox.com",
    "userId" : "5177016b738218636f00000a"
  });

  var link2 = new LinkModel ({
    "__v" : 0,
    "comparableURLHash" : "bbe593a37fcb05d66a0a07ea078a3e1530649ec997191984e5aa0644b55bf95b",
    "gmMsgHex" : "13d78c1adac538b7",
    "gmMsgId" : "1429765453680818359",
    "gmThreadId" : "1429765453680818359",
    "isPromoted" : false,
    "mailCleanSubject" : "Daily Rollup",
    "mailId" : "5146bef4caa56d9f52044356",
    "nonPromotableReason" : "sender",
    "recipients" : [
      {
        "name" : "andrewjameslockhart@gmail.com",
        "email" : "andrewjameslockhart@gmail.com"
      }
    ],
    "resolvedURL" : "https://www.dropbox.com/",
    "sender" : {
      "name" : "Unrollme",
      "email" : "rollup@unroll.me"
    },
    "sentDate" : "2013-03-17T15:29:51Z",
    "shardKey" : "f7bee",
    "timestamp" : "2013-03-18T07:17:22.713Z",
    "title" : "Dropbox",
    "url" : "http://Dropbox.com",
    "userId" : "5177016b738218636f00000a"
  });

  var link3 = new LinkModel ({
    "__v" : 0,
    "comparableURLHash" : "bbe593a37fcb05d66a0a07ea078a3e1530649ec997191984e5aa0644b55bf95b",
    "gmMsgHex" : "13d78c1adac538b7",
    "gmMsgId" : "1429765453680818359",
    "gmThreadId" : "1429765453680818359",
    "isPromoted" : false,
    "mailCleanSubject" : "Def not delete",
    "mailId" : "5146bef4caa56d9f52044356",
    "nonPromotableReason" : "sender",
    "recipients" : [
      {
        "name" : "andrewjameslockhart@gmail.com",
        "email" : "andrewjameslockhart@gmail.com"
      }
    ],
    "resolvedURL" : "https://www.dropbox.com/",
    "sender" : {
      "name" : "Unrollme",
      "email" : "rollup@unroll.me"
    },
    "sentDate" : "2013-03-17T14:29:51Z",
    "shardKey" : "f7bee",
    "timestamp" : "2013-03-19T07:17:22.713Z",
    "title" : "Dropbox",
    "url" : "http://Dropbox.com",
    "userId" : "5177016b738218636f00000a"
  });

  link1.save (function (err) {
    if (err) {
      console.error (err);
    }
  });

  link2.save (function (err) {
    if (err) {
      console.error (err);
    }
  });

  link3.save (function (err) {
    if (err) {
      console.error (err);
    }
  });

});