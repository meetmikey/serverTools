#!/usr/bin/php
<?php

$cmd = "ps aux | grep 'java -Delasticsearch-service' | awk '{print $2}'";
$esPID = exec($cmd);

if ( ! $esPID ) {
        echo "elasticsearch CRITICAL: no PID found\n";
        exit(2);
}

echo "elasticsearch OK: PID: $esPID\n";
exit(0);
