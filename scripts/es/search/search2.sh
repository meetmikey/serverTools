curl -XPOST localhost:9200/mail/resource/_search?pretty -d '{
  "fields": ["file","title", "content-type"],
  "query" : {
    "bool" : {
      "must" : [
        { 
          "term": { 
            "isLink": { "value": true, boost: 0 } 
          }
        }
      ],
      "should" : [
        {
          "multi_match" : {
            "query" : "hello world jdurack",
            "fields" : [ "file", "title" ],
            "operator" : "and"
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
                      "userId": { "value": "51782c2c9cfeff2f4a000009", "boost": 0 }
                    }
                  }
                ],
                "should": [
                  {
                    "multi_match" : {
                      "query" : "hello world jdurack",
                      "fields": 
                        [ "filename",
                         "url",
                         "authorName",
                         "authorEmail",
                         "recipientNames",
                         "recipientEmails",
                         "emailBody",
                         "emailSubject"],
                     "operator" : "and"
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
      ],
      "minimum_number_should_match" : 2
    }
  }
}'