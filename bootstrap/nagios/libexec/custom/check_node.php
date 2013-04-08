#!/usr/bin/php
<?php

$app = 'app.js';
if ( $argc >= 2 ) {
  $app = $argv[1] . ".js";
}

$cmd = "ps aux | grep node | grep " . $app . "  | grep -v forever | awk '{print $2}'";
$nodePID = exec($cmd);

if ( ! $nodePID ) {
	echo "node CRITICAL: no node PID found\n";
	exit(2);
}

echo "node OK: PID: $nodePID\n";
exit(0);