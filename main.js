var plotData = [];
var map;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");

function init() {
  $('#time-series-graph').bind('plothover',function(event,pos,item) {
    if (item) {
      var x = new Date(item.datapoint[0]);
      var y = item.datapoint[1];
      if (prevPoint != item.dataIndex) {
        $('#tooltip').remove();
        var a = item.series.label.match(/(\([^\)]*\))<\/a>/);
        if (a.length == 2) {
          var u = a.pop();
          u = u.substr(1,u.length - 2);
        }
        showToolTip(
           item.pageX
          ,item.pageY
          ,new Date(x).format('UTC:yyyy-mm-dd HH:00"Z"') + ' : ' + (Math.round(y * 100) / 100) + ' ' + u);
      }
      prevPoint = item.dataIndex;
    }
    else {
      $('#tooltip').remove();
      prevPoint = null;
    }
  });

  $('.selectpicker').selectpicker({width : 200});

  resize();

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
    ]
    ,center : new OpenLayers.LonLat(-83,28).transform(proj4326,proj3857)
    ,zoom   : 5
  });
}

function plot() {
  var plot = $.plot(
     $('#time-series-graph')
    ,plotData
    ,{
       xaxis     : {mode  : "time"}
      ,crosshair : {mode  : 'x'   }
      ,grid      : {
         backgroundColor : {colors : ['#fff','#C3DFE5']}
        ,borderWidth     : 1
        ,borderColor     : '#A6D1DB'
        ,hoverable       : true
      }
      ,zoom      : {interactive : true}
      ,pan       : {interactive : true}
      ,legend    : {backgroundOpacity : 0.3}
    }
  );
}

function query() {
  $.ajax({
     url      : 'get.php?' + 'http://tds.secoora.org/thredds/ncss/grid/clim_daily_avg_surface.nc?var=temp&latitude=27.169&longitude=-82.92&time_start=2011-05-01T00:00:00Z&time_end=2011-12-31T00:00:00Z&accept=xml&vertCoord=-0.986111111111111'
    ,dataType : 'xml'
    ,title    : 'sst'
    ,success  : function(r) {
      var $xml = $(r);
      var uom;
      var d = {
         data  : []
        ,label : '&nbsp;<a target=_blank href="' + this.url + '">' + this.title + ' (' + 'C' + ')' + '</a>'
      };
      $xml.find('point').each(function() {
        var point = $(this);
        d.data.push([
           isoDateToDate(point.find('[name=date]').text())
          ,point.find('[name=temp]').text()
        ]); 
        d.uom = point.find('[name=temp]').attr('units');
      });
      plotData.push(d);
      plot();
    }
    ,error    : function(r) {
      plot();
    }
  });
}

function showToolTip(x,y,contents) {
  $('<div id="tooltip">' + contents + '</div>').css({
     position           : 'absolute'
    ,display            : 'none'
    ,top                : y + 10
    ,left               : x + 10
    ,border             : '1px solid #99BBE8'
    ,padding            : '2px'
    ,'background-color' : '#fff'
    ,opacity            : 0.80
    ,'z-index'          : 10000001
  }).appendTo("body").fadeIn(200);
}

function isoDateToDate(s) {
  // 2010-01-01T00:00:00 or 2010-01-01 00:00:00
  s = s.replace("\n",'');
  var p = s.split(/T| /);
  if (p.length == 2) {
    var ymd = p[0].split('-');
    var hm = p[1].split(':');
    var d = new Date(
       ymd[0]
      ,ymd[1] - 1
      ,ymd[2]
      ,hm[0]
      ,hm[1]
    );
    return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
  }
  else {
    return false;
  }
}

function resize() {
  var offset = 51;
  $('#map').height($('#time-series-graph').height() - $('#vars').height() - $('#years').height() - $($('.bootstrap-select')[0]).height() - offset);
  map && map.updateSize();
  plot();
}

window.onresize = resize;
