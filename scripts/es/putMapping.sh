curl -XPUT "http://localhost:9200/$1/document/_mapping" -d @$SERVER_COMMON/config/elasticSearch/documentMapping.json
