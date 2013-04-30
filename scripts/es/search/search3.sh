curl -XPOST localhost:9200/mail/resource/_search?pretty -d '{
  "fields": ["file","title", "content-type"],
  "query" : {
    "bool" : {
      "must" : [
        { 
          "term": { 
            "isLink": { "value": true, boost: 0 } 
          }
        },
        {
          "queryString": {
            "fields": ["file", "title"],
            "query": "hello world"
          }
        },
        {
          "multi_match" : {
            "query" : "hello world Justin",
            "fields" : [ "file", "title" ],
            "operator" : "and"
          }
        }
      ],
      "should" : [
        {
          "queryString": {
            "fields": ["file", "title"],
            "query": "hello world"
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
                      "query": "hello world justin" 
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