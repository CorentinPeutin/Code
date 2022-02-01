const lodashClonedeep = require('lodash.clonedeep')

function coeffs_x_y(x1,y1,x2,y2){
  // calcul des coefficients
  var trip_r_coeff = 5; // param de jacques

  var angle = Math.pi - math.atan(abs(y2-y1)/abs(x2-x1));
  var abs_cx = Math.sin(angle)*trip_r_coeff;
  var abs_cy = Math.cos(angle)*trip_r_coeff;

  if (x2-x1 > 0){
    var cy = -abs_cy;
  }
  else {
    var cy = abs_cy;
  }

  if (y2-y1 > 0){
    var cx = -abs_cx;
  }
  else {
    var cx = abs_cx;
  }

  return [cx,cy];
}

function creation_json (raw, nom_fich, type_objet, nb_class=1){

    var list_arc = [];
    var dict_node = {};

    var trip_template = [];
    for (var i = 0; i < nb_class.length; i++) {
      trip_template.push({id:i, nb:0});
    }

    var raw = "A DEFINIR"; // donner la ligne suivante

    var [id_dep, id_arr] = [-1,-1];

    while raw {
      var id_start_end = [raw[2],raw[3]];

      if (id_start_end != [id_dep,id_arr]){

          try {
              list_arc.push(json_arc);
          }

          var id_path = raw[0];
          var [id_dep, id_arr] = id_start_end;

          var [x1,y1] = [raw[5],raw[6]];
          var [x2,y2] = [raw[7],raw[8]];
          var [cx,cy] = coeffs_x_y(x1,y1,x2,y2);

          var json_arc = {id:id_path,
                          id_dep:id_dep,
                          id_arr:id_arr,
                          x1:x1,
                          y1:y1,
                          x2:x2,
                          y2:y2,
                          xc_origin:Math.min(x2,x1) + Math.abs(x2-x1)/2,
                          yc_origin:Math.min(y2,y1) + Math.abs(y2-y1)/2,
                          xc_coeff:cx,
                          yc_coeff:cy,
                          nb_trip:0,
                          list_graph_trip:lodashClonedeep(trip_template)
                        };
      }

      var nb_trip = raw[1];
      var id_class = raw[4];

      json_arc.list_graph_trip[id_class].nb = nb_trip;
      json_arc.nb_trip += nb_trip;

      for (var i = 0; i < 2; i++) {
          var [x,y] = [[x1,y1],[x2,y2]][i];
          var direction = ['dep','arr'][i];
          var id_node = [id_dep,id_arr][i];

          try {
              var dict_node[id_node];
          }
          except (KeyError){
              dict_node[id_node] = {id:id_node,
                                    x:x,
                                    y:y,
                                    a_coeff:200,
                                    nb_trip_dep:0,
                                    nb_trip_arr:0,
                                    list_graph_dep:lodashClonedeep(trip_template),
                                    list_graph_arr:lodashClonedeep(trip_template)
                                  }
          }

          dict_node[id_node]['nb_trip_'+direction] += nb_trip;
          dict_node[id_node]['list_graph_'+direction][id_class].nb += nb_trip;
      }
      raw = "A DEFINIR" // donner la ligne suivante
    }


    var fs = require('fs');
    fs.writeFile(nom_fich+"_arc.json", JSON.stringify({table:list_arc}));
    fs.writeFile(nom_fich+"_node.json", JSON.stringify({table:Object.values(dict_node)}));
}
