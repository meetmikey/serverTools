#!/usr/bin/php

<?php
  /*
   * PHP library for Mixpanel data API -- http://www.mixpanel.com/
   * Requires PHP 5.2 with JSON
   */
  
  class Mixpanel
  {
    private $api_url = 'http://mixpanel.com/api';
    private $api_export_url = 'http://data.mixpanel.com/api';
    private $version = '2.0';
    private $api_key;
    private $api_secret;
    private $file_prefix;
    
    public function __construct($api_key, $api_secret, $export_directory) {
      $this->api_key = $api_key;
      $this->api_secret = $api_secret;
      $this->file_prefix = $export_directory;
    }
    
    public function request($methods, $isExport, $params, $format='json') {
      // $end_point is an API end point such as events, properties, funnels, etc.
      // $method is an API method such as general, unique, average, etc.
      // $params is an associative array of parameters.
      // See https://mixpanel.com/docs/api-documentation/data-export-api
      
      //if (count($params) < 1)
        //return false;
      
      if (!isset($params['api_key']))
        $params['api_key'] = $this->api_key;
      
      $params['format'] = $format;
      
      if (!isset($params['expire'])) {
        $current_utc_time = time() - date('Z');
        $params['expire'] = $current_utc_time + 100000; // Default 10 minutes
      }
      
      $param_query = '';
      foreach ($params as $param => &$value) {
        if (is_array($value))
          $value = json_encode($value);
        $param_query .= '&' . urlencode($param) . '=' . urlencode($value);
      }
      
      $sig = $this->signature($params);
      
      $uri = '/' . $this->version . '/' . join('/', $methods) . '/';
      $request_url = $uri . '?sig=' . $sig . $param_query;
      
      $url = '';
      if ( $isExport ) {
        $url .= $this->api_export_url;
      } else {
        $url .= $this->api_url;
      }
      $url .= $request_url;

      //print_r('url: ' . $url . "\n");

      $curl_handle=curl_init();
      curl_setopt($curl_handle,CURLOPT_URL, $url);
      curl_setopt($curl_handle,CURLOPT_CONNECTTIMEOUT,2);
      curl_setopt($curl_handle,CURLOPT_RETURNTRANSFER,1);
      $data = curl_exec($curl_handle);
      curl_close($curl_handle);

      //print_r($data);
          
      return $data;
    }

    public function getDataForParamSet($endpoint, $isExport, $paramSet) {
      foreach( $paramSet as $name => $params) {
        print_r('retrieving data for ' . $name . '...');
        $filename = $this->file_prefix . $name . '.txt';
        
        if ( $isExport ) {
          file_put_contents( $filename, $this->request(array($endpoint), $isExport, $params) );

        } else {
          $done = false;
          $pageNumber = null;
          $sessionId = null;
          $resultsArray = [];
          while ( ! $done ) {
            
            if ( $pageNumber !== null ) {
              $params['page'] = $pageNumber;
            }
            if ( $sessionId ) {
              $params['session_id'] = $sessionId;
            }

            $data = $this->request(array($endpoint), $isExport, $params);
            $json = json_decode( $data );
            $resultsJSON = $json->results;
            $resultsArray = array_merge( $resultsArray, $resultsJSON );

            print_r( "\npage: " . $pageNumber . ", results: " . count( $resultsJSON ) );

            if ( count($resultsJSON) == 0 ) {
              $done = true;
            } else {
              $pageNumber = $json->page + 1;
              $sessionId = $json->session_id;
            }
          }
          $resultsStr = json_encode( $resultsArray );
          file_put_contents( $filename, $resultsStr );
        }
        print_r("done.\n");
      }
    }
    
    private function signature($params) {
      ksort($params);
          $param_string ='';
      foreach ($params as $param => $value) {
        $param_string .= $param . '=' . $value;
      }
      
      return md5($param_string . $this->api_secret);
    }
  }

  class MixpanelExport {

    private $api_key = '2cde374ed78b7262dcb00ae5f6882010';
    private $api_secret = '9be34eb310356666c1291f89f67bf0cb';
    private $export_directory = '/home/jdurack/Desktop/mixpanelData/';
    private $mp;

    public function __construct() {
      $this->mp = new Mixpanel($this->api_key, $this->api_secret, $this->export_directory);
    }
    
    public function getFullExportData() {
      $exportParams = array(
          'january' => array('from_date' => '2013-01-01', 'to_date' => '2013-01-31')
        , 'february' => array('from_date' => '2013-02-01', 'to_date' => '2013-02-28')
        , 'march' => array('from_date' => '2013-03-01', 'to_date' => '2013-03-31')
        , 'april' => array('from_date' => '2013-04-01', 'to_date' => '2013-04-30')
        , 'may' => array('from_date' => '2013-05-01', 'to_date' => '2013-05-31')
        , 'june' => array('from_date' => '2013-06-01', 'to_date' => '2013-06-30')
        , 'july' => array('from_date' => '2013-07-01', 'to_date' => '2013-07-31')
        , 'august1' => array('from_date' => '2013-08-01', 'to_date' => '2013-08-07')
        , 'august2' => array('from_date' => '2013-08-08', 'to_date' => '2013-08-14')
        , 'august3' => array('from_date' => '2013-08-15', 'to_date' => '2013-08-21')
        , 'august4' => array('from_date' => '2013-08-22', 'to_date' => '2013-08-28')
        , 'august5' => array('from_date' => '2013-08-29', 'to_date' => '2013-08-31')
        , 'september1' => array('from_date' => '2013-09-01', 'to_date' => '2013-09-06')
        , 'september2' => array('from_date' => '2013-09-07', 'to_date' => '2013-09-12')
        , 'september3' => array('from_date' => '2013-09-13', 'to_date' => '2013-09-18')
        , 'september4' => array('from_date' => '2013-09-19', 'to_date' => '2013-09-24')
        , 'september5' => array('from_date' => '2013-09-25', 'to_date' => '2013-09-30')
        , 'october1' => array('from_date' => '2013-10-01', 'to_date' => '2013-10-06')
        , 'october2' => array('from_date' => '2013-10-07', 'to_date' => '2013-10-12')
        , 'october3' => array('from_date' => '2013-10-13', 'to_date' => '2013-10-18')
        , 'october4' => array('from_date' => '2013-10-19', 'to_date' => '2013-10-24')
        , 'october5' => array('from_date' => '2013-10-25', 'to_date' => '2013-10-31')
        , 'november1' => array('from_date' => '2013-11-01', 'to_date' => '2013-11-06')
        , 'november2' => array('from_date' => '2013-11-07', 'to_date' => '2013-11-12')
        , 'november3' => array('from_date' => '2013-11-13', 'to_date' => '2013-11-18')
        , 'november4' => array('from_date' => '2013-11-19', 'to_date' => '2013-11-24')
        , 'november5' => array('from_date' => '2013-11-25', 'to_date' => '2013-11-30')
        , 'december' => array('from_date' => '2013-12-01', 'to_date' => '2013-12-09')
      );
      $this->mp->getDataForParamSet('export', true, $exportParams);
    }

    public function getUserData() {
      $exportParams = array(
        'users' => array()
      );
      $this->mp->getDataForParamSet('engage', false, $exportParams);
    }
  }
    
  $mixpanelExport = new MixpanelExport();
  //$mixpanelExport->getFullExportData();
  $mixpanelExport->getUserData();
?>