curl -XPOST 'http://localhost:9200/_aliases' -d '
{
    "actions" : [
      { 
        "add" : { 
          "index" : "mail_v3",
          "alias" : "5180ad72146bfe7c20000009_mail_v3",
          "filter" :  {"term" : {"user" : "5180ad72146bfe7c20000009"} },
          "routing" : "5180ad72146bfe7c20000009"
        } 
      }
    ]
}'
