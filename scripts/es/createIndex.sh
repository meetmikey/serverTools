curl -XPUT 'http://localhost:9200/mail_v2/' -d '
{
    "number_of_shards": 10,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer" : {
        "email" : {
          "type": "pattern",
          "lowercase" : "true",
          "pattern":"[\\.@\\s+]",
          "stopwords" : ["com", "hotmail", "gmail", "outlook", "net", "org", "edu", "msn", "yahoo", "gov", "aol", "comcast", "spcglobal"]
        },
        "url" : {
          "type": "pattern",
          "lowercase" : "true",
          "pattern":"[\\./\\-_?&\\=\\s+]",
          "stopwords" : ["com", "org", "edu", "gov", "net", "http", "https", "http:", "https:", "www", "www.", "uk", "ca", "de"]
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
