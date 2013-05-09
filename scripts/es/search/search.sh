curl -XPOST localhost:9200/mail_v1/document/_search?pretty -d '{
    "fields" : ["isLink", "date", "mailId", "filename", "authorName", "authorEmail", "emailBody", "emailSubject", "docType"],
    size : 30,
    query : {
      multi_match : {
        "query" : false,
        "fields" : ["isLink"],
        "operator" : "and"
      }
    }
}'
