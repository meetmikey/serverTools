#!/usr/bin/php
<?php

$cmd = "ps aux | grep node | grep app.js  | grep -v forever | awk '{print $2}'";
$nodePID = exec($cmd);

if ( ! $nodePID ) {
	echo "node CRIITCAL: no node PID found\n";
	exit(2);
}

echo "node OK: PID: $nodePID\n";
exit(0);