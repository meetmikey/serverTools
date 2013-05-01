curl -XPOST localhost:9200/mail/resource/_search?pretty -d '{
  "fields": ["file","title", "content-type"],
  "sort" : {
     "size" : {"order" : "desc"}
  },
  "query" : {
    "bool" : {
      "must" : [
        { 
          "term": { 
            "isLink": { "value": false, boost: 0 } 
          }
        },
        {
          "multi_match" : {
            "query" : "mikey",
            "fields" : [ "file", "title" ],
            "operator" : "and"
          }
        }
      ],
      "should" : [
        {
          "queryString": {
            "fields": ["file", "title"],
            "query": "mikey"
          }
        },
        {
          "top_children" : {
            "type": "resourceMeta",
            "query": {
              "bool": {
               "must": [
                  { 
                    "term": { 
                      "userId": { "value": "5180a4a29a947a7515000009", "boost": 0 }
                    }
                  }
                ],
                "should": [
                  { "queryString": 
                    { 
                      "fields": 
                        [ "filename",
                         "url",
                         "authorName",
                         "authorEmail",
                         "recipientNames",
                         "recipientEmails",
                         "emailBody",
                         "emailSubject"],
                      "query": "mikey" 
                    } 
                  }
                ]
              }
            },
            "score" : "max",
            "factor" : 5,
            "incremental_factor" : 2
          }
        }
      ]
    }
  }
}'
