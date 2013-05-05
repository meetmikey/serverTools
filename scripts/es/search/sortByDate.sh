curl -XPOST localhost:9200/mail/resourceMeta/_search?pretty -d '{
  "fields": ["isLink", "date", "mailId"],
  "sort" : {
    "date" : {"order" : "desc"}
  },
  "query" : {
     "term" : { "userId" : "5180ad72146bfe7c20000009"}
   }
}'
