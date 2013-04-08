#!/usr/bin/php
<?php

$cmd = "ps aux | grep java | grep sbt | grep -v 'sh -c' | awk '{print $2}'";
$finaglePID = exec($cmd);

if ( ! $finaglePID ) {
	echo "finagle CRITICAL: no PID found\n";
	exit(2);
}

echo "finagle OK: PID: $finaglePID\n";
exit(0);
