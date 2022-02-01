var zoom_intervals = [1,1.5,2,2.5];
var zoom_levels = ["hexa", "iris", "sous_district", "district"];

function define_zoom_intervals(scale_list, zoom_levels){
  // conversion d'échelle carto à échelle leaflet
  return zoom_intervals;
}

function get_zoom_level(leaflet_zoom, zoom_intervals, zoom_levels){

  for (var i = 0; i < zoom_intervals.length; i++) {
    if (zoom_intervals[i] > leaflet_zoom) {
      break;
    }
  }
  return zoom_levels[i];
}
