var plotData = [];
var lyrQuery;
var lyrCatalog = new OpenLayers.Layer.Vector();
var map;
var spinner;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");

function init() {
  $('#coords .btn-default').on('click',function() {
    $('#location').selectpicker('val','custom');
    $('#coords').modal('hide');
  });

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

  _.each(catalog.variables.sort(),function(o) {
    $('#vars').after($('</h4>')).append('<button type="button" data-value="' + o + '" class="btn btn-default">' + o + '</button> ');
  });
  $('#vars [data-value="' + defaults.var + '"]').removeClass('btn-default').addClass('btn-custom-lighten active');
  $('#vars button').click(function() {
    $(this).blur();
    var selVal = $(this).data('value');
    $('#vars button').each(function() {
      if ($(this).data('value') == selVal) {
        $(this).removeClass('btn-default').addClass('btn-custom-lighten').addClass('active');
      }
      else {
        $(this).removeClass('btn-custom-lighten').removeClass('active').addClass('btn-default');
      }
    });
    query();
  });

  _.each(catalog.years.sort(),function(o) {
    $('#years').after($('</h4>')).append('<button type="button" data-value="' + o + '" class="btn btn-default">' + o + '</button> ');
  });
  $('#years [data-value="' + defaults.year + '"]').removeClass('btn-default').addClass('btn-custom-lighten active');
  $('#years button').click(function() {
    $(this).blur();
    var selVal = $(this).data('value');
    $('#years button').each(function() {
      if ($(this).data('value') == selVal) {
        $(this).removeClass('btn-default').addClass('btn-custom-lighten').addClass('active');
      }
      else {
        $(this).removeClass('btn-custom-lighten').removeClass('active').addClass('btn-default');
      }
    });
    query();
  });

  var wkt = new OpenLayers.Format.WKT();
  var i = 1;
  _.each(_.sortBy(_.keys(catalog.sites),function(o){return o.toUpperCase()}),function(grp) {
    $('#location').append('<optgroup label="' + grp + '">');
    _.each(_.sortBy(_.keys(catalog.sites[grp]),function(o){return o.toUpperCase()}),function(site) {
      var selected = defaults.site == site ? 'selected="selected"' : '';
      $($('#location optgroup')[i]).append('<option value="' + site + '" ' + selected + '>' + site + '</option>');
      var f = wkt.read(catalog.sites[grp][site]['wkt']);
      f.geometry.transform(proj4326,proj3857);
      f.attributes = {
         'group' : grp
        ,'name'  : site
      };
      lyrCatalog.addFeatures([f]);
    });
    i++;
  });

  $('#location').change(function() {
    $(this).blur();
    var val = $(this).selectpicker().val();
    if (val == 'manual') {
      $('#coords')
        .bootstrapValidator({
           excluded      : [':disabled']
          ,feedbackIcons : {
            valid      : 'glyphicon glyphicon-ok',
            invalid    : 'glyphicon glyphicon-remove',
            validating : 'glyphicon glyphicon-refresh'
          }
          ,fields : {
            customLat : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
            ,customLon : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
          }
        })
        .on('shown.bs.modal', function() {
          $('#coords').bootstrapValidator('resetForm',true);
          $('#coords').find('[name="customLat"]').focus();
        })
        .on('error.validator.bv', function(e, data) {
          data.element
          .data('bv.messages')
          // Hide all the messages
          .find('.help-block[data-bv-for="' + data.field + '"]').hide()
          // Show only message associated with current validator
          .filter('[data-bv-validator="' + data.validator + '"]').show();
        })
        .on('success.form.bv', function(e) {
          e.preventDefault();
          lyrQuery.removeAllFeatures();
          var f = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point($('#customLon').val(),$('#customLat').val()).transform(proj4326,proj3857)
          );
          lyrQuery.addFeatures([f]);
          $('#location').selectpicker('val','custom');
          $('#coords').modal('hide');
          query();
        })
        .modal('show');
    }
    else {
      lyrQuery.removeAllFeatures();
      var f = _.find(lyrCatalog.features,function(o){return o.attributes.name == val});
      if (f) {
        lyrQuery.addFeatures([f.clone()]);
        map.setCenter([f.geometry.x,f.geometry.y],5);
        query();
      }
    }
  });

  $('.selectpicker').selectpicker({width : 200});

  resize();

  var style = new OpenLayers.Style(
    OpenLayers.Util.applyDefaults({
       pointRadius       : 8
      ,strokeColor       : '#000000'
      ,strokeOpacity     : 0.8
      ,fillColor         : '#ff0000'
      ,fillOpacity       : 0.8
    })
  );
  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
       'default' : style
      ,'select'  : style
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
      ,lyrQuery
    ]
    ,center : new OpenLayers.LonLat(-83,28).transform(proj4326,proj3857)
    ,zoom   : 4
  });

  map.events.register('click',this,function(e) {
    lyrQuery.removeAllFeatures();
    var lonLat = map.getLonLatFromPixel(e.xy);
    var f = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.Point(lonLat.lon,lonLat.lat)
    );
    lyrQuery.addFeatures([f]);
    $('#location').selectpicker('val','custom');
    query();
  });

  var f = _.find(lyrCatalog.features,function(o) {
    return o.attributes.name == defaults.site;
  });
  lyrQuery.addFeatures([f.clone()]);
  map.setCenter([f.geometry.x,f.geometry.y],5);

  query();
}

function plot() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
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
  if (spinner) {
    return;
  }
  // from http://fgnass.github.io/spin.js/
  var opts = {
    lines: 17, // The number of lines to draw
    length: 35, // The length of each line
    width: 10, // The line thickness
    radius: 54, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };
  spinner = new Spinner(opts).spin(document.getElementById('time-series-graph'));

  // Find the 1st hit in the catalog that is closest to the query point.
  var queryPt = lyrQuery.features[0].geometry;
  var siteQuery = _.find(lyrCatalog.features,function(f) {
    return f.geometry.distanceTo(queryPt) == 0;
  });
  var urls = [];
  var title = '';
  if (siteQuery) {
    var geom = siteQuery.geometry.clone().transform(proj3857,proj4326);
    urls = [
      catalog['sites'][siteQuery.attributes.group][siteQuery.attributes.name].getObs(
         $('#vars .active').text()
        ,$('#years .active').text()
        ,$('#years .active').text()
      )
      ,catalog['sites'][siteQuery.attributes.group][siteQuery.attributes.name].getObs(
         $('#vars .active').text()
        ,catalog.years[0]
        ,catalog.years[catalog.years.length - 1]
      )
    ]
    title = ' from ' + siteQuery.attributes.name;
  }
  else {
    var geom = queryPt.clone().transform(proj3857,proj4326);
    urls = [
      catalog['models']['SABGOM'].getObs(
         $('#vars .active').text()
        ,$('#years .active').text()
        ,$('#years .active').text()
        ,geom.x
        ,geom.y
      )
      ,catalog['models']['SABGOM'].getObs(
         $('#vars .active').text()
        ,catalog.years[0]
        ,catalog.years[catalog.years.length - 1]
        ,geom.x
        ,geom.y
      )
    ]
    title = ' from ' + 'SABGOM';
  }

  plotData = [];
  $.ajax({
     url      : urls[0]
    ,dataType : 'xml'
    ,title    : $('#vars .active').text() + title
    ,success  : function(r) {
      plotData.push(processData($(r),this.url,this.title));
      plot();
    }
    ,error    : function(r) {
      plot();
    }
  });

/*
  if (/clim_daily_avg_surface/.test(urls[1])) {
    $.ajax({
       url      : urls[1]
      ,dataType : 'xml'
      ,title    : $('#vars .active').text() + title
      ,success  : function(r) {
        plotData.push(processData($(r),this.url,this.title));
        plot();
      }
      ,error    : function(r) {
        plot();
      }
    });
  }
*/
}

function processData($xml,url,title) {
  var d = {data  : []};
  var ncss = $xml.find('point');
  if (ncss.length > 0) { // NetcdfSubset resposne
    ncss.each(function() {
      var point = $(this);
      d.data.push([
         isoDateToDate(point.find('[name=date]').text())
        ,point.find('[name=temp]').text()
      ]);
      d.label = '&nbsp;<a target=_blank href="' + url + '">' + title + ' (' + point.find('[name=temp]').attr('units') + ')' + '</a>';
    });
  }
  else { // ncSOS resposne
    // var nil = $xml.find('nilValue').text();
    var nil = ["-999.9","-999.0"]; // CHANGEME #
    d.label = '&nbsp;<a target=_blank href="' + url + '">' + title + ' (' + $xml.find('uom[code]').attr('code') + ')' + '</a>';
    _.each($xml.find('values').text().split(" "),function(o) {
      var a = o.split(',');
      if ((a.length == 2 || a.length == 3) && $.isNumeric(a[1])) {
        // only take the 1st value for each time
        var t = isoDateToDate(a[0]).getTime();
        if (!_.find(d.data,function(o){return o[0] == t}) && nil.indexOf(a[1]) < 0) {
          d.data.push([t,a[1]]);
        }
      }
    });
  }
  return d;
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
