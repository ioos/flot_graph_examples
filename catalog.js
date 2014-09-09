var catalog = {
   'years'     : [2011,2012,2013,2014]
  ,'variables' : ['Temperature','Salinity']
  ,'sites' : {
    'NDBC' : {
      '41004' : {
        'sourceType' : 'ndbcSOS'
        ,'wkt' : 'POINT(-79.09 32.5)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'sea_water_temperature'
            ,'Salinity'    : 'sea_water_salinity'
          };
          return {u : 'get.php?http://sdf.ndbc.noaa.gov/sos/server.php?request=GetObservation&service=SOS&version=1.0.0&offering=urn:ioos:station:wmo:41004&observedproperty='+ vh[v] +'&responseformat=text/xml;subtype=%22om/1.0.0%22&eventtime='+year0+'-03-01T00:00Z/'+year1+'-03-29T00:00Z' };
        }
      }
    }

    ,'CRCOOS' : {
      'CAP2' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-79.62 32.8)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/carocoops.cap2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }
      ,'FRP2' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-80.4 32.27)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/carocoops.frp2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }

      ,'SUN2' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-78.48 33.83)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/carocoops.sun2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }
    }
    ,'USF' : {
       'C10' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-82.92 27.169)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/usf.c10.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }
      ,'C12' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-83.721 27.498)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/usf.c12.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }
      ,'C13' : {
        'sourceType' : 'ncSOS'
        ,'wkt' : 'POINT(-83.073 26.063)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'water_temperature'
            ,'Salinity'    : 'salinity'
          };
          return {u : 'get.php?http://tds.secoora.org/thredds/sos/usf.c13.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;schema%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]};
        }
      }
    }
  }
  ,'models' : {
    'SABGOM' : {
      'sourceType' : 'ncss'
      ,'getObs' : function(v,year,lon,lat,stat) {
        var vh = {
           'Temperature' : ['temp','']
          ,'Salinity'    : ['salt','_salt']
        };
        var d = 'clim_daily_avg_surface';
        if (stat) {
          d    = 'clim_all_daily_' + stat + '_surface'
          year = '2018';
        }
        return {
          u : 'get.php?' + 'http://tds.secoora.org/thredds/ncss/grid/' + d + vh[v][1] + '.nc?var=' + vh[v][0] + '&latitude=' + lat + '&longitude=' + lon + '&time_start=' + year + '-01-01T00:00:00Z&time_end=' + year + '-12-31T23:59:59Z&accept=xml'
          ,v : vh[v][0]
        };
      }
      ,'wkt' : ''
    }

    ,'HYCOM' : {
      'sourceType' : 'wms'
        ,'getObs' : function(v,year,bbox) {
        var vh = {
           'Temperature' : ['water_temp']
          ,'Salinity'    : ['salinity']
        };
        return {
          u : 'get.php?http://ecowatch.ncddc.noaa.gov/thredds/wms/hycom/hycom_reg1_agg/HYCOM_Region_1_Aggregation_best.ncd?&LAYERS='+ vh[v][0] +'&ELEVATION=0&TIME='+year+'-03-04T00:00:00.000Z/'+year+'-09-04T00:00:00.000Z&TRANSPARENT=true&STYLES=boxfill%2Frainbow&CRS=EPSG%3A4326&COLORSCALERANGE=-50%2C50&NUMCOLORBANDS=20&LOGSCALE=false&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&EXCEPTIONS=application%2Fvnd.ogc.se_inimage&FORMAT=image%2Fpng&SRS=EPSG%3A4326&BBOX='+ bbox +'&X=1&Y=1&INFO_FORMAT=text/xml&QUERY_LAYERS='+ vh[v][0] +'&WIDTH=2&HEIGHT=2'
          ,v : vh[v][0]
        };
      }
      ,'wkt' : ''
    }

    ,'USF_OCG' : {
      'sourceType' : 'wms'
        ,'getObs' : function(v,year,bbox) {
        var vh = {
           'Temperature' : ['temp']
          ,'Salinity'    : ['salt']
        };
        return {
          u : 'get.php?http://crow.marine.usf.edu:8080/thredds/wms/WFS_ROMS_NF_model/USF_Ocean_Circulation_Group_West_Florida_Shelf_Daily_ROMS_Nowcast_Forecast_Model_Data_best.ncd?&LAYERS='+ vh[v][0] +'&TIME='+ year +'-01-01T00:00:00.000Z/'+ year +'-12-31T00:00:00.000Z&TRANSPARENT=true&STYLES=boxfill%2Frainbow&CRS=EPSG%3A4326&COLORSCALERANGE=-50%2C50&NUMCOLORBANDS=20&LOGSCALE=false&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&EXCEPTIONS=application%2Fvnd.ogc.se_inimage&FORMAT=image%2Fpng&SRS=EPSG%3A4326&BBOX='+ bbox +'&X=1&Y=1&INFO_FORMAT=text/xml&QUERY_LAYERS='+ vh[v][0] +'&WIDTH=2&HEIGHT=2'
          ,v : vh[v][0]
        };
      }
      ,'wkt' : ''
    }

  }
};

var defaults = {
   'year' : 2013
  ,'var'  : 'Temperature'
  ,'site' : 'SUN2'
};
