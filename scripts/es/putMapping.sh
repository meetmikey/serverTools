curl -XPUT 'http://localhost:9200/mail_v3/resource/_mapping' -d @$SERVER_COMMON/config/elasticSearch/resourceMapping.json
curl -XPUT 'http://localhost:9200/mail_v3/resourceMeta/_mapping' -d @$SERVER_COMMON/config/elasticSearch/resourceMetaMapping.json
