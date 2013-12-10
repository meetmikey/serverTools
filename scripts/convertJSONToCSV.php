#!/usr/bin/php
<?php

$json_str = "{'aintlist':[4,3,2,1], 'astringlist':['str1','str2']}";

if ( $argc < 2 ) {
  print_r("usage: ./convertJSONToCSV.php <filename> [properties_sub_key]");
  exit(1);
}

$inputFilename = $argv[1];
$propertiesSubKey = null;
if ( $argc >= 3 ) {
  $propertiesSubKey = $argv[2];
}

$inputFileHandle = fopen( $inputFilename, 'r' );
$inputFileContents = fread($inputFileHandle, filesize($inputFilename));
fclose($inputFileHandle);


$outputFilename = substr($inputFilename, 0, strpos( $inputFilename, '.' )) . '.csv';
$outputFileHandle = fopen($outputFilename, 'w');

$json = json_decode($inputFileContents);

$headers = [];

foreach ($json as $fields) {
  if ( $propertiesSubKey ) {
    $fields = $fields->$propertiesSubKey;
  }
  $keys = array_keys( get_object_vars( $fields ) );
  foreach( $keys as $key ) {
    if ( ! in_array( $key, $headers ) ) {
      array_push( $headers, $key );
    }
  }
}

$first = true;
$str = '';
foreach ($headers as $header) {
  
  if ( ! $first ) {
    $str .= ',';
  }
  $first = false;

  if ( substr($header, 0, 1) == "$" ) {
    $str .= substr($header, 1);
  } else {
    $str .= $header;
  }
}
$str .= "\n";
fwrite( $outputFileHandle, $str );

foreach ($json as $fields) {
  if ( $propertiesSubKey ) {
    $fields = $fields->$propertiesSubKey;
  }
  $first = true;
  $str = '';
  foreach ($headers as $header) {

    if ( ! $first ) {
      $str .= ',';
    }
    $first = false;

    if ( array_key_exists($header, $fields) ) {
      $value = $fields->$header;
      if ( is_array( $value ) ) {
        $value = implode("|", $value);
      }
      $str .= $value;
    }
  }
  $str .= "\n";
  fwrite( $outputFileHandle, $str );
}
fclose($outputFileHandle);