curl -XPUT "http://localhost:9200/$1/" -d '
{
    "number_of_shards": 20,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer" : {
        "email" : {
          "type": "pattern",
          "lowercase" : "true",
          "pattern":"[\\.@\\s+]"
        },
        "url" : {
          "type": "pattern",
          "lowercase" : "true",
          "pattern":"[\\./\\-_?&\\=\\s+]"
        },
        "default_analyzer" : {
          "type" : "snowball",
          "language" : "English"
        },
        "html_analyzer" : {
          "type" : "custom",                
          "tokenizer" : "standard",
          "filter" : ["standard", "lowercase", "stop"],
          "char_filter": "html_strip"
        }
      }
    }
  }
}'
