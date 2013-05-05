curl -XPOST localhost:9200/twitter/tweet/_search?pretty -d '{
    "fields" : ["user", "post_date", "message"],
    "size" : 30,
    "query" : {
      "query_string" : {
        "query" : "elastic kimchy",
        "fields" : [ 
          "user", 
          "message"
        ],
        "default_operator" : "and"
      }
    }
}'