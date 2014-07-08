<?php
  $url = sprintf(
     "http://omgarch1.meas.ncsu.edu:8080/thredds/ncss/grid/fmrc/sabgom/SABGOM_Forecast_Model_Run_Collection_best.ncd?var=temp&latitude=%f&longitude=%f&time_start=%s&time_end=%s&accept=xml&vertCoord=%f"
    ,$_REQUEST['lat']
    ,$_REQUEST['lon']
    ,$_REQUEST['minT']
    ,$_REQUEST['maxT']
    ,$_REQUEST['z']
  );

  $data = array(
     'lon'  => NULL
    ,'lat'  => NULL
    ,'u'    => NULL
    ,'data' => array()
    ,'min'  => NULL
    ,'max'  => NULL
    ,'fid'  => $_REQUEST['fid']
  );
  date_default_timezone_set('UTC');

  $xml = simplexml_load_string(file_get_contents($url));
  foreach ($xml->{'point'} as $p) {
    $row = array();
    foreach ($p->{'data'} as $d) {
      $row[sprintf("%s",$d->attributes()->{'name'})] = array(
         'v' => sprintf("%s",$d)
        ,'u' => sprintf("%s",$d->attributes()->{'units'})
      );
    }
    $val = (float)$row['temp']['v'];
    array_push($data['data'],array(
       'x' => strtotime($row['date']['v'])
      ,'y' => $val
    ));
    $data['lon'] = $row['lon']['v'];
    $data['lat'] = $row['lat']['v'];
    $data['u'] = $row['temp']['u'];
    $data['min'] = (!isset($data['min']) || $val < $data['min']) ? (float)sprintf("%.02f",$val - (0.1 * $val)) : $data['min'];
    $data['max'] = (!isset($data['max']) || $val > $data['max']) ? (float)sprintf("%.02f",$val + (0.1 * $val)) : $data['max'];
  }

  header('Content-type: application/json');
  echo json_encode($data);
?>
