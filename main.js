var map;
var lyrQuery;
var fidQuery = 1;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");
var graph;
var x_axis;
var hoverDetail;
var palette = new Rickshaw.Color.Palette();

function init() {
  $("#variable").buttonset();
  $("#refresh").button();
  $("#clearAll").button().click(function() {
    lyrQuery.removeAllFeatures();
    updateGraph();
    fidQuery = 1;
    palette = new Rickshaw.Color.Palette();
  });

  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
      'default' : new OpenLayers.Style(
         OpenLayers.Util.applyDefaults({
           label             : '${id}'
          ,labelAlign        : 'cm'
          ,fontFamily        : 'Arial, Helvetica, sans-serif'
          ,fontSize          : 11
          ,pointRadius       : 8
          ,strokeColor       : '${color}'
          ,strokeOpacity     : 0.8
          ,fillColor         : '#ffffff'
          ,fillOpacity       : 0.8
        })
        ,{
          context : {
          }
        }
      )
    })}
  );

  map = new OpenLayers.Map('map',{
    layers  : [
      new OpenLayers.Layer.Google('Google Satellite',{
         type              : google.maps.MapTypeId.TERRAIN
        ,sphericalMercator : true
        ,wrapDateLine      : true
      })
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
      query({x : lonLat.lon,y : lonLat.lat},{
         lon : lonLat4326.lon
        ,lat : lonLat4326.lat
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

function query(center,data) {
  var fid = fidQuery++;
  var f = new OpenLayers.Feature.Vector(
    new OpenLayers.Geometry.Point(center.x,center.y)
  );
  f.attributes.id = fid;
  f.attributes.color = palette.color();
  lyrQuery.addFeatures([f]);

  var minT = $('#date-slider').dateRangeSlider('min').format('yyyy-mm-dd"T"HH:00:00"Z"');
  var maxT = $('#date-slider').dateRangeSlider('max').format('yyyy-mm-dd"T"HH:00:00"Z"');
  var z = '-0.986111111111111';

  OpenLayers.Request.issue({
     url : './getSabgom.php?z=' + z + '&lon=' + data.lon + '&lat=' + data.lat + '&minT=' + minT + '&maxT=' + maxT + '&fid=' + fid
    ,callback : function(r) {
      var json = new OpenLayers.Format.JSON().read(r.responseText);
      var f = _.find(lyrQuery.features,function(o){return o.attributes.id == fid});
      f.attributes.data = json.data;
      f.attributes.min  = json.min;
      f.attributes.max  = json.max;
      f.attributes.u    = ' (' + json.u + ')';
      updateGraph();
    }
  });
}

function updateGraph() {
  $('#y_axis').empty();
  $('#chart').empty();
  delete y_axis;
  delete graph;
  delete hoverDetail;
  var min = false;
  var max = false;
  var series = [];
  _.each(_.sortBy(lyrQuery.features,function(o){return -1 * o.attributes.id}),function(f) {
    min = !min || f.attributes.min < min ? f.attributes.min : min;
    max = !max || f.attributes.max > max ? f.attributes.max : max;
    series.push({name : 'Query #' + f.attributes.id + f.attributes.u,data : f.attributes.data,color : f.attributes.color});
  });
  if (series.length > 0) {
    graph = new Rickshaw.Graph({
       element  : document.getElementById("chart")
      ,min      : min
      ,max      : max
      ,renderer : 'line'
      ,series   : series
    });
    var x_axes = new Rickshaw.Graph.Axis.Time({graph : graph});
    y_axis = new Rickshaw.Graph.Axis.Y({
       graph       : graph
      ,orientation : 'left'
      ,tickFormat  : Rickshaw.Fixtures.Number.formatKMBT
      ,element     : document.getElementById('y_axis')
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
