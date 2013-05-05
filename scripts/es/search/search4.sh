curl -XPOST localhost:9200/mail_v1/document/_search?pretty -d '{
    "fields" : ["isLink", "date", "mailId", "filename", "authorName", "authorEmail", "emailSubject", "docType", "recipientNames"],
    size : 30,
    query : {
      "query_string" : {
        "query" : "dropbox Andrew",
        "fields" : [ 
          "file", 
          "authorName", 
          "authorEmail", 
          "authorEmailKey"
        ],
        "default_operator" : "and"
      }
    }
}'