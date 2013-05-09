curl -XPOST localhost:9200/mail_v1/document/_search?pretty -d '{
    "fields" : ["isLink", "date", "mailId", "file.title", "authorName", "authorEmail", "emailBody", "emailSubject"],
    size : 30,
    query : {
      multi_match : {
        "query" : "dropbox Andrew",
        "fields" : [ "file", "title", "filename", "url", "authorName", "authorEmail", "recipientNames", "recipientEmails", "emailBody", "emailSubject" ],
        "operator" : "and"
      }
    }
}'
