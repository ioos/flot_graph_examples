<?php
  date_default_timezone_set('UTC');
  $data = array(
     'u'    => $_REQUEST['observedProperty'] == 'water_temperature' ? 'Celcius' : NULL
    ,'data' => array()
    ,'min'  => NULL
    ,'max'  => NULL
    ,'url'  => $_SERVER[QUERY_STRING]
  );

  $xml = @simplexml_load_file($_SERVER[QUERY_STRING]);
  if ($xml !== FALSE && $xml->children('http://www.opengis.net/om/1.0')->{'member'} && $xml->children('http://www.opengis.net/om/1.0')->{'member'}[0]->children('http://www.opengis.net/om/1.0')) {
    $values = sprintf("%s",$xml
      ->children('http://www.opengis.net/om/1.0')->{'member'}[0]
      ->children('http://www.opengis.net/om/1.0')->{'Observation'}[0]
      ->children('http://www.opengis.net/om/1.0')->{'result'}[0]
      ->children('http://www.opengis.net/om/1.0')->{'DataArray'}[0]
      ->children('http://www.opengis.net/swe/1.0')->{'values'}
    );
    foreach (explode(" ",$values) as $pairs) {
      $p = explode(',',$pairs);
      $val = (float)$p[1];
      if ($val != -999.9) {
        array_push($data['data'],array(
           'x' => strtotime($p[0])
          ,'y' => (float)$p[1]
        ));
        $data['min'] = (!isset($data['min']) || $p[1] < $data['min']) ? (float)sprintf("%.02f",$p[1] - abs(0.1 * $p[1])) : $data['min'];
        $data['max'] = (!isset($data['max']) || $p[1] > $data['max']) ? (float)sprintf("%.02f",$p[1] + abs(0.1 * $p[1])) : $data['max'];
      }
    }
  }

  header('Content-type: application/json');
  echo json_encode($data);
?>
