#!/usr/bin/php
<?php

$inputFilename = '/home/jdurack/Desktop/caUsers.txt';
$outputFilename = '/home/jdurack/Desktop/caUsersMongoQuery.txt';

$inputFileHandle = fopen( $inputFilename, 'r' );

$prefix = 'db.mails.find({userId:{$in:[';
$suffix = ']}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1})';
$suffix .= '.forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});' . "\n";

$i = 0;
$q = $prefix;
$first = true;
while ( ( $line = fgets( $inputFileHandle ) ) !== FALSE ) {
  if ( ( $i > 0 ) && ( ( $i % 100 ) == 0 ) ) {
    $q .= $suffix . $prefix;
    $first = true;
  }
  if ( ! $first ) {
    $q .= ',';
  }
  $first = false;
  $q .= 'ObjectId("' . trim( $line ) . '")';
  $i++;
}
$q .= $suffix;

file_put_contents( $outputFilename, $q );
fclose($inputFileHandle);