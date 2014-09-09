flot_graph_examples
===========

This is a copy of some initial work by cgalvarino at https://github.com/cgalvarino/climatology using javascript [flot](http://www.flotcharts.org/) graphing library to display time series graphs initially from ncSOS and thredds ncss web services.  I thought the initial code was a good reference point for demonstrating the flot library combined with parsing the various xml services to get a quick browser-based visual and comparison between data sources using the catalog.js file which describes the input sources to the graph selection.

The current demo for this tool is at http://secoora.org/ts_compare/index.html and shows the comparison of an in-situ buoy measurements(using ncSOS access) to daily average model measurements(using ncss access).

The catalog.js entries contain a sourceType attribute which is currently:

- ncSOS
- ndbcSOS
- wms , this is the GetFeatureInfo query method for wms
- ncss , this is netcdf subset query method for gridded netcdf 

Currently to add a new data source to graph, follow one of the above examples for the catalog.js entry and also within the main.js file push a similarly labeled reference(ncSOS,ndbcSOS,wms,ncss) onto the 'reqs' array.

To add additional web service parsing methods, see the sourceType handling under the 'processData' function of main.js

I would like to have everything driven from the catalog.js file or similar json configuration files with listing and toggling of all enabled data sources, but that was more time than I wanted to invest for the moment.


