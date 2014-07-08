var map;
var lyrQuery;
var fidQuery = 1;
var activeQuery = {};
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");
var graph;
var x_axis;
var y0_axis;
var y1_axis;
var hoverDetail;
var palette = new Rickshaw.Color.Palette();

function init() {
  $("#variable").buttonset();
  $('#variable input[type=radio]').change(function(){
    var v = $(this).attr('id');
    var off = {};
    if (v == 'Both') {
      v = ['Temperature','Salinity'];
      off = {
        Temperature : 0
       ,Salinity    : 0.5
      };
    }
    else {
      v = [v];
      off[v] = 0;
    }
    var features = [];
    _.each(lyrQuery.features,function(o) {
      var c = o.geometry.getCentroid();
      var c4326 = c.clone().transform(proj3857,proj4326);
      _.each(v,function(p) {
        if (o.attributes.off != 0.5) {
          features.push([c,c4326,p]);
        }
      });
    });
    palette = new Rickshaw.Color.Palette();
    lyrQuery.removeAllFeatures();
    fidQuery = 1;
    updateGraph();
    _.each(features,function(o) {
      query({x : o[0].x,y : o[0].y},{lon : o[1].x,lat : o[1].y,v : o[2]},off[o[2]]);
    });
  });
  $("#refresh").button().click(function() {
    var features = [];
    _.each(lyrQuery.features,function(o) {
      var c = o.geometry.getCentroid();
      var c4326 = c.clone().transform(proj3857,proj4326);
      features.push([c,c4326,o.attributes.var,o.attributes.off]);
    });
    palette = new Rickshaw.Color.Palette();
    lyrQuery.removeAllFeatures();
    fidQuery = 1;
    updateGraph();
    _.each(features,function(o) {
      query({x : o[0].x,y : o[0].y},{lon : o[1].x,lat : o[1].y,v : o[2]},o[3]);
    });
  });
  $("#clearAll").button().click(function() {
    palette = new Rickshaw.Color.Palette();
    lyrQuery.removeAllFeatures();
    fidQuery = 1;
    updateGraph();
  });

  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
      'default' : new OpenLayers.Style(
         OpenLayers.Util.applyDefaults({
           label             : '${getLabel}'
          ,labelAlign        : 'cm'
          ,fontFamily        : 'Arial, Helvetica, sans-serif'
          ,fontSize          : 11
          ,pointRadius       : '${getPointRadius}' // 8
          ,strokeColor       : '${color}'
          ,strokeOpacity     : 0.8
          ,fillColor         : '#ffffff'
          ,fillOpacity       : '${getFillOpacity}' // 0.8
        })
        ,{
          context : {
            getLabel : function(f) {
              return /\.5$/.test(f.attributes.id) ? '' : f.attributes.id;
            }
            ,getFillOpacity : function(f) {
              return /\.5$/.test(f.attributes.id) ? 0 : 0.8;
            }
            ,getPointRadius : function(f) {
              return /\.5$/.test(f.attributes.id) ? 12 : 8;
            }
          }
        }
      )
    })}
  );

  map = new OpenLayers.Map('map',{
    layers  : [
      new OpenLayers.Layer.XYZ(
         'ESRI Ocean'
        ,'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}.jpg'
        ,{
           sphericalMercator : true
          ,isBaseLayer       : true
          ,wrapDateLine      : true
        }
      )
      ,new OpenLayers.Layer.Vector('SABGOM',{
         strategies : [new OpenLayers.Strategy.Fixed()]
        ,protocol   : new OpenLayers.Protocol.HTTP({
           url    : 'data/sabgom.kml'
          ,format : new OpenLayers.Format.KML()
        })
        ,styleMap   : new OpenLayers.StyleMap({
          'default' : new OpenLayers.Style(
            OpenLayers.Util.applyDefaults({
               fillOpacity   : 0
              ,strokeWidth   : 1
              ,strokeColor   : '#0000ff'
              ,strokeOpacity : 1
            })
          )
        })
      })
      ,lyrQuery
    ]
    ,center : new OpenLayers.LonLat(-83,28).transform(proj4326,proj3857)
    ,zoom   : 5
  });

  map.events.register('click',this,function(e) {
    if ($(e.target).attr('class') != 'olPopupCloseBox') {
      var lonLat = map.getLonLatFromPixel(e.xy);
      var lonLat4326 = lonLat.clone().transform(proj3857,proj4326);
      var v = $("input:radio[name='variable']:checked").attr('id');
      var off = {};
      if (v == 'Both') {
        v = ['Temperature','Salinity'];
        off = {
          Temperature : 0
         ,Salinity    : 0.5
        };
      }
      else {
        v = [v];
        off[v] = 0;
      }
      var i = 0;
      _.each(v,function(o) {
        query({x : lonLat.lon,y : lonLat.lat},{
           lon : lonLat4326.lon
          ,lat : lonLat4326.lat
          ,v   : o
        },off[o]);
      });
    }
  });

  $('#date-slider').dateRangeSlider({
    bounds : {
       min : new Date(2011,0,1)
      ,max : new Date(Date.now())
    }
    ,defaultValues : {
       min : new Date(2014,4,1)
      ,max : new Date(Date.now())
    }
  });

  $('#date-slider').bind('valuesChanged',function(e,data){
  });
}

function query(center,data,fidOffset) {
  var fid;
  if (fidOffset > 0) {
    fid = fidQuery - fidOffset; 
  }
  else {
    fid = fidQuery++;
  }
  var f = new OpenLayers.Feature.Vector(
    new OpenLayers.Geometry.Point(center.x,center.y)
  );
  f.attributes.id = fid;
  f.attributes.color = palette.color();
  lyrQuery.addFeatures([f]);
  activeQuery[fid] = true;
  var size = _.size(activeQuery);
  $("#refresh").prop('disabled',true);
  $("#clearAll").prop('disabled',true);
  $('#status').html('Processing ' + size + ' ' + (size > 1 ? 'queries' : 'query') + ' <img src="img/progressDots.gif">');

  var minT = $('#date-slider').dateRangeSlider('min').format('yyyy-mm-dd"T"HH:00:00"Z"');
  var maxT = $('#date-slider').dateRangeSlider('max').format('yyyy-mm-dd"T"HH:00:00"Z"');
  var z = '-0.986111111111111';

  OpenLayers.Request.issue({
     url : './getSabgom.php?z=' + z + '&lon=' + data.lon + '&lat=' + data.lat + '&minT=' + minT + '&maxT=' + maxT + '&fid=' + fid + '&var=' + data.v + '&off=' + fidOffset
    ,callback : function(r) {
      var json = new OpenLayers.Format.JSON().read(r.responseText);
      var f = _.find(lyrQuery.features,function(o){return o.attributes.id == fid});
      f.attributes.off  = json.off;
      f.attributes.var  = json.var;
      f.attributes.data = json.data;
      f.attributes.min  = json.min;
      f.attributes.max  = json.max;
      f.attributes.u    = !_.isEmpty(json.u) ? ' (' + json.u + ')' : '';
      delete activeQuery[fid];
      if (_.size(activeQuery) == 0) {
        $('#status').html('&nbsp;');
        $("#refresh").prop('disabled',false);
        $("#clearAll").prop('disabled',false);
      }
      else {
        var size = _.size(activeQuery);
        $('#status').html('Processing ' + size + ' ' + (size > 1 ? 'queries' : 'query') + ' <img src="img/progressDots.gif">');
      }
      updateGraph();
    }
  });
}

function updateGraph() {
  $('#y0_axis').empty();
  $('#y1_axis').empty();
  $('#chart').empty();
  delete y0_axis;
  delete y1_axis;
  delete graph;
  delete hoverDetail;
  var ranges = {
     Temperature : [false,false]
    ,Salinity    : [false,false]
  };
  _.each(_.sortBy(lyrQuery.features,function(o){return -1 * o.attributes.id}),function(f) {
    if (f.attributes.var) {
      ranges[f.attributes.var][0] = !ranges[f.attributes.var][0] || f.attributes.min < ranges[f.attributes.var][0] ? f.attributes.min : ranges[f.attributes.var][0];
      ranges[f.attributes.var][1] = !ranges[f.attributes.var][1] || f.attributes.max > ranges[f.attributes.var][1] ? f.attributes.max : ranges[f.attributes.var][1];
    }
  });
  var scales = {
     Temperature : ranges['Temperature'] ? d3.scale.linear().domain([ranges['Temperature'][0],ranges['Temperature'][1]]) : false
    ,Salinity    : ranges['Salinity'] ? d3.scale.linear().domain([ranges['Salinity'][0],ranges['Salinity'][1]]) : false
  };
  var series = [];
  _.each(_.sortBy(lyrQuery.features,function(o){return -1 * o.attributes.id}),function(f) {
    if (f.attributes.data) {
      series.push({
         name  : 'Query #' + Math.floor(f.attributes.id) + ' ' + f.attributes.var + f.attributes.u
        ,data  : f.attributes.data
        ,color : f.attributes.color
        ,scale : scales[f.attributes.var]
      });
    }
  });
  if (series.length > 0) {
    graph = new Rickshaw.Graph({
       element  : document.getElementById("chart")
      ,renderer : 'line'
      ,series   : series
    });
    var x_axes = new Rickshaw.Graph.Axis.Time({graph : graph});
    y0_axis = new Rickshaw.Graph.Axis.Y.Scaled({
       graph       : graph
      ,orientation : 'left'
      ,tickFormat  : Rickshaw.Fixtures.Number.formatKMBT
      ,element     : document.getElementById('y0_axis')
      ,scale       : scales['Temperature']
    });
    y1_axis = new Rickshaw.Graph.Axis.Y.Scaled({
       graph       : graph
      ,orientation : 'right'
      ,tickFormat  : Rickshaw.Fixtures.Number.formatKMBT
      ,element     : document.getElementById('y1_axis')
      ,scale       : scales['Salinity']
    });
    graph.render();
    hoverDetail = new Rickshaw.Graph.HoverDetail({
       graph      : graph
      ,xFormatter : function(x) {
        return new Date(x * 1000).toString();
      }
    });
  }
}
