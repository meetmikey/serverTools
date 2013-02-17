#!/usr/bin/php
<?php

$cmd = "curl -XGET 'http://localhost:9200/_cluster/health?pretty=true' | grep status | awk -F '\" : \"' '{print $2}' | awk -F '\"' '{print $1}'";
$esHealth = exec($cmd);

//echo "health: $esHealth\n";

if ( $esHealth == 'green' ) {
        echo "elasticsearch health OK: indicator: $esHealth\n";
        exit(0);
} else if ( $esHealth == 'yellow' ) {
        echo "elasticsearch health WARNING: indicator: $esHealth\n";
        //TEMP: considering yellow healthy for now (10/10/2012)
        exit(0);
        //exit(1);
} else {
        echo "elasticsearch health CRITICAL: indicator: $esHealth\n";
        exit(2);
}

//unknown
exit(3);