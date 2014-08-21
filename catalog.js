var catalog = {
   'years'     : [2011,2012,2013,2014]
  ,'variables' : ['Temperature','Salinity']
  ,'sites' : {
    'CRCOOS' : {
      'CAP2' : {
        'wkt' : 'POINT(-79.62 32.8)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/carocoops.cap2.buoy.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
      ,'FRP2' : {
        'wkt' : 'POINT(-80.4 32.27)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/carocoops.frp2.buoy.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
      ,'SUN2' : {
        'wkt' : 'POINT(-78.48 33.83)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/carocoops.sun2.buoy.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
    }
    ,'USF' : {
       'C10' : {
        'wkt' : 'POINT(-82.92 27.169)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/usf.c10.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
      ,'C12' : {
        'wkt' : 'POINT(-83.721 27.498)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/usf.c12.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
      ,'C13' : {
        'wkt' : 'POINT(-83.073 26.063)'
        ,'getObs' : function(v,year0,year1) {
          var n2o = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return 'get.php?http://tds.secoora.org/thredds/sos/usf.c13.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + n2o[v];
        }
      }
    }
  }
  ,'models' : {
    'SABGOM' : {
      'getObs' : function(v,year0,year1,lon,lat) {
        var n2o = {
           'Temperature' : 'temp'
          ,'Salinity'    : 'salt'
        };
        return 'get.php?' + 'http://tds.secoora.org/thredds/ncss/grid/clim_daily_avg_surface.nc?var=' + n2o[v] + '&latitude=' + lat + '&longitude=' + lon + '&time_start=' + year0 + '-01-01T00:00:00Z&time_end=' + year1 + '-12-31T23:59:59Z&accept=xml&vertCoord=-0.986111111111111';
      }
      ,'wkt' : ''
    }
  }
};

var defaults = {
   'year' : 2011
  ,'var'  : 'Temperature'
  ,'site' : 'C10'
};
