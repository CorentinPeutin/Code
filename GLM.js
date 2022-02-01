
// Fonctions d affichage
function create_leaf(graph_object_list,svg_id){



  d3.select("#" + svg_id).selectAll(".leaf_test").remove();



  for(var j=0; j< graph_object_list.length; j++){
    var rest_of_trip = graph_object_list[j].nb_trip;

    var first = true;

    for(var i = 0; i<graph_object_list[j].list_graph_trip.length;i++){
      if(graph_object_list[j].list_graph_trip[i].nb>0){
        var path = d3.path();
        path.moveTo(graph_object_list[j].x1, graph_object_list[j].y1);
        path.quadraticCurveTo(
          graph_object_list[j].xc_origin + (rest_of_trip * graph_object_list[j].xc_coeff),
          graph_object_list[j].yc_origin + (rest_of_trip * graph_object_list[j].yc_coeff),
          graph_object_list[j].x2,
          graph_object_list[j].y2
        );
        path.closePath();

        rest_of_trip = rest_of_trip - graph_object_list[j].list_graph_trip[i].nb;

        if(first==true){
          d3.select("#" + svg_id)
            .append("path")
            .attr("class","leaf_test")
            .attr("d",path)
          .attr("fill", graph_object_list[j].list_graph_trip[i].color)
            .attr("stroke", "black");

          first = false;
        } else {
          d3.select("#" + svg_id)
            .append("path")
            .attr("class","leaf_test")
            .attr("d",path)
          .attr("fill", graph_object_list[j].list_graph_trip[i].color);
        }


      }
    }

    if(graph_object_list[j].nb_trip>0){

      var axis_path = d3.path();
      axis_path.moveTo(graph_object_list[j].x1, graph_object_list[j].y1);
      axis_path.lineTo(
        graph_object_list[j].x2,
        graph_object_list[j].y2
      );
      d3.select("#" + svg_id)
        .append("path")
        .attr("class","leaf_test")
        .attr("d",axis_path)
      .attr("stroke", "black")
    }


  }

  return "ok";

  }

function create_city(city_object_list,svg_id){

  d3.select("#" + svg_id).selectAll(".city_test").remove();

  for(var j=0; j< city_object_list.length; j++){


    var rest_of_dep = city_object_list[j].nb_trip_dep*city_object_list[j].a_coeff;

    for(var i = 0; i<city_object_list[j].list_graph_dep.length;i++){

      if(city_object_list[j].list_graph_dep[i].nb>0){

        var radius = Math.sqrt(rest_of_dep/Math.PI)

        var path = d3.path();
        path.arc(city_object_list[j].x,city_object_list[j].y,radius,Math.PI*0.5,Math.PI*1.5);
        path.closePath();
        rest_of_dep = rest_of_dep - city_object_list[j].list_graph_dep[i].nb*city_object_list[j].a_coeff;


        d3.select("#" + svg_id)
          .append("path")
          .attr("class","city_test")
          .attr("d",path)
      .attr("stroke", "black")
        .attr("fill", city_object_list[j].list_graph_dep[i].color);

      }
    }


    var rest_of_arr = city_object_list[j].nb_trip_arr*city_object_list[j].a_coeff;

    for(var i = 0; i<city_object_list[j].list_graph_arr.length;i++){



      if(city_object_list[j].list_graph_arr[i].nb>0){

        var radius = Math.sqrt(rest_of_arr/Math.PI)

        var path = d3.path();
        path.arc(city_object_list[j].x,city_object_list[j].y,radius,Math.PI*1.5,Math.PI*0.5);
          path.closePath();
        rest_of_arr = rest_of_arr - city_object_list[j].list_graph_arr[i].nb*city_object_list[j].a_coeff;


        d3.select("#" + svg_id)
          .append("path")
          .attr("class","city_test")
          .attr("d",path)
      .attr("stroke", "black")
        .attr("fill", city_object_list[j].list_graph_arr[i].color);

      }
    }


  }

  return "ok";
  }

function create_city_flow_objects(city_list,flow_list,date_classification_array){
    var city_object_list = [];
    var trip_object_list = [];

  var a_coeff = 200;
  var trip_r_coeff = 5;

  //attention, les données représentés sont toujours relatives à des horaires de DEPARTS
  //Le diagramme montrant les  "arrivées" sur Grenoble fait référence aux horaires de DEPART dans les différentes villes => à explorer

    for(var i=0; i<city_list.length; i++){
        //itération départs
      //create city object with empty trip and 0 dep/arr
      city_object_list.push(
        {
          id:city_list[i].id,
          name:city_list[i].name,
          x:city_list[i].x,
          y:city_list[i].y,
          a_coeff:a_coeff,
          nb_trip_dep:0,
          nb_trip_arr:0,
          list_graph_dep:[],
          list_graph_arr:[]
        }
      );

      for(var o =0;o<date_classification_array.length; o++){
          city_object_list[city_object_list.length-1].list_graph_dep.push(
            {
              id:date_classification_array[o].id,
              nb:0,
              color:date_classification_array[o].color,
              beg_time_period:date_classification_array[o].beg_time_period,
              end_time_period:date_classification_array[o].end_time_period
            }
          )

          city_object_list[city_object_list.length-1].list_graph_arr.push(
            {
              id:date_classification_array[o].id,
              nb:0,
              color:date_classification_array[o].color,
              beg_time_period:date_classification_array[o].beg_time_period,
              end_time_period:date_classification_array[o].end_time_period
            }
          )
      }

        for(var j=0; j<city_list.length; j++){
            //itération arrivée
            if(city_list[j].id!=city_list[i].id){
              //create trip object with empty trip and 0 trip
              //calcul origin and axis of controlpoint
              var angle = Math.PI - Math.atan(Math.abs(city_list[j].y-city_list[i].y)/Math.abs(city_list[j].x-city_list[i].x));

              var abs_cx = Math.sin(angle)*trip_r_coeff;
              var abs_cy = Math.cos(angle)*trip_r_coeff;

              var cx;
              var cy;

              if((city_list[j].x-city_list[i].x)>0){
                  cy = -abs_cy;
              }else{
                  cy = abs_cy;
              }

              if((city_list[j].y-city_list[i].y)>0){
                  cx = -abs_cx;
              }else{
                  cx = abs_cx;
              }

              trip_object_list.push(
                                {
                  id:trip_object_list.length,
                  id_dep:city_list[i].id,
                  id_arr:city_list[j].id,
                  x1:city_list[i].x,
                  y1:city_list[i].y,
                  x2:city_list[j].x,
                  y2:city_list[j].y,
                  xc_origin:Math.min(city_list[j].x,city_list[i].x) + Math.abs(city_list[j].x-city_list[i].x)/2,
                  yc_origin:Math.min(city_list[j].y,city_list[i].y) + Math.abs(city_list[j].y-city_list[i].y)/2,
                  xc_coeff:cx,
                  yc_coeff:cy,
                  nb_trip:0,
                  list_graph_trip:[]
                }
              );

	              for(var o =0;o<date_classification_array.length; o++){
                  trip_object_list[trip_object_list.length-1].list_graph_trip.push(
                    {
                      id:date_classification_array[o].id,
                      nb:0,
                      color:date_classification_array[o].color,
                      beg_time_period:date_classification_array[o].beg_time_period,
                      end_time_period:date_classification_array[o].end_time_period
                    }
                  )
              }

            }
        }
    }

        for(var i=0; i<flow_list.length; i++){
        //itération flow

        for(var j=0; j<city_object_list.length; j++){
          //ici peut être juste faire appel à la ligne correspondante
            if(city_object_list[j].id == flow_list[i].dep){
              //test sur horaire
              //rajout dans nb de depart et dans le bon trip
              for(var u =0; u< date_classification_array.length; u++){
                if(flow_list[i].dep_date >= date_classification_array[u].beg_time_period && flow_list[i].dep_date < date_classification_array[u].end_time_period){
                  for(var k =0; k< city_object_list[j].list_graph_dep.length; k++){
                    if(city_object_list[j].list_graph_dep[k].id == date_classification_array[u].id){
                      city_object_list[j].list_graph_dep[k].nb = city_object_list[j].list_graph_dep[k].nb +1;
                    }
                  }
                  break;
                }
              }
              city_object_list[j].nb_trip_dep = city_object_list[j].nb_trip_dep +1;
            }

            if(city_object_list[j].id == flow_list[i].arr){
              //test sur horaire
              //rajout dans nb de arrivée et dans le bon trip
              for(var u =0; u< date_classification_array.length; u++){
                if(flow_list[i].dep_date >= date_classification_array[u].beg_time_period && flow_list[i].dep_date < date_classification_array[u].end_time_period){
                  for(var k =0; k< city_object_list[j].list_graph_arr.length; k++){
                    if(city_object_list[j].list_graph_arr[k].id == date_classification_array[u].id){
                      city_object_list[j].list_graph_arr[k].nb = city_object_list[j].list_graph_arr[k].nb +1;
                    }
                  }
                  break;
                }
              }
              city_object_list[j].nb_trip_arr = city_object_list[j].nb_trip_arr +1;
            }
        }

		        for(var j=0; j<trip_object_list.length; j++){

            if(trip_object_list[j].id_dep == flow_list[i].dep && trip_object_list[j].id_arr == flow_list[i].arr){
              //test sur horaire
              //rajout dans nb de trip et dans le bon trip
              for(var u =0; u< date_classification_array.length; u++){
                if(flow_list[i].dep_date >= date_classification_array[u].beg_time_period && flow_list[i].dep_date < date_classification_array[u].end_time_period){
                  for(var k =0; k< trip_object_list[j].list_graph_trip.length; k++){
                    if(trip_object_list[j].list_graph_trip[k].id == date_classification_array[u].id){
                      trip_object_list[j].list_graph_trip[k].nb = trip_object_list[j].list_graph_trip[k].nb +1;
                    }
                  }
                  break;
                }
              }
              trip_object_list[j].nb_trip = trip_object_list[j].nb_trip +1;
            }
        }
    }

	      return {city_object_list:city_object_list,trip_object_list:trip_object_list}
}

var city_list = [
      {id:0,name:'Lyon',x:50,y:200},
      {id:1,name:'Grenoble',x:850,y:200},
      {id:2,name:'Gap',x:850,y:400}
    ];

var flow_list = [
        {id:0, dep:0,arr:1,dep_date:'08:30:00',arr_date:'10:30:00'},
    {id:1, dep:0,arr:1,dep_date:'08:30:00',arr_date:'10:30:00'},
    {id:2, dep:0,arr:1,dep_date:'08:30:00',arr_date:'10:30:00'},
    {id:3, dep:0,arr:1,dep_date:'12:30:00',arr_date:'14:30:00'},
    {id:4, dep:0,arr:1,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:5, dep:0,arr:1,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:6, dep:0,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:7, dep:0,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:8, dep:0,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:9, dep:0,arr:1,dep_date:'21:30:00',arr_date:'23:30:00'},
    {id:10, dep:0,arr:1,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:11, dep:0,arr:1,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:12, dep:0,arr:1,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:13, dep:0,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:14, dep:0,arr:1,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:15, dep:0,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:16, dep:1,arr:2,dep_date:'21:30:00',arr_date:'23:30:00'},
    {id:17, dep:1,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:18, dep:1,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:19, dep:1,arr:2,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:20, dep:1,arr:2,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:21, dep:1,arr:2,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:22, dep:1,arr:2,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:23, dep:1,arr:2,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:24, dep:1,arr:2,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:25, dep:2,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:26, dep:2,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:27, dep:2,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:28, dep:2,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:29, dep:2,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:30, dep:2,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:31, dep:2,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:32, dep:2,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:33, dep:2,arr:0,dep_date:'21:30:00',arr_date:'23:30:00'},
    {id:34, dep:2,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:35, dep:2,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:36, dep:2,arr:0,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:37, dep:2,arr:0,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:38, dep:2,arr:0,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:39, dep:0,arr:2,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:40, dep:0,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:41, dep:0,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:42, dep:0,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:43, dep:0,arr:2,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:44, dep:0,arr:2,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:45, dep:0,arr:2,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:46, dep:0,arr:2,dep_date:'21:30:00',arr_date:'23:30:00'},
    {id:47, dep:0,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:48, dep:0,arr:2,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:49, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:50, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:51, dep:1,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:52, dep:1,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:53, dep:1,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:54, dep:1,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:55, dep:1,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:56, dep:1,arr:0,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:57, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:58, dep:1,arr:0,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:59, dep:1,arr:0,dep_date:'21:30:00',arr_date:'23:30:00'},
    {id:60, dep:1,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:61, dep:1,arr:0,dep_date:'14:30:00',arr_date:'16:30:00'},
    {id:62, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:63, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:64, dep:1,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:65, dep:1,arr:0,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:66, dep:1,arr:0,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:67, dep:2,arr:1,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:68, dep:2,arr:1,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:69, dep:2,arr:1,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:70, dep:2,arr:1,dep_date:'06:30:00',arr_date:'22:30:00'},
    {id:71, dep:2,arr:1,dep_date:'06:30:00',arr_date:'16:30:00'},
    {id:79, dep:2,arr:1,dep_date:'20:30:00',arr_date:'22:30:00'},
    {id:80, dep:1,arr:0,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:81, dep:1,arr:0,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:82, dep:1,arr:0,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:83, dep:1,arr:0,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:84, dep:1,arr:0,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:85, dep:1,arr:0,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:86, dep:1,arr:0,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:87, dep:2,arr:1,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:88, dep:2,arr:1,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:89, dep:2,arr:1,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:90, dep:2,arr:1,dep_date:'04:30:00',arr_date:'16:30:00'},
    {id:91, dep:2,arr:1,dep_date:'04:30:00',arr_date:'16:30:00'},
    {id:92, dep:2,arr:1,dep_date:'04:30:00',arr_date:'22:30:00'},
    {id:93, dep:0,arr:1,dep_date:'04:30:00',arr_date:'22:30:00'},
    {id:94, dep:0,arr:1,dep_date:'04:30:00',arr_date:'16:30:00'},
    {id:95, dep:0,arr:1,dep_date:'04:30:00',arr_date:'16:30:00'},
    {id:96, dep:0,arr:2,dep_date:'04:30:00',arr_date:'22:30:00'},
    {id:97, dep:0,arr:1,dep_date:'04:30:00',arr_date:'22:30:00'},
    {id:98, dep:0,arr:1,dep_date:'04:30:00',arr_date:'16:30:00'},
    {id:99, dep:0,arr:1,dep_date:'04:30:00',arr_date:'22:30:00'},
    {id:100, dep:0,arr:2,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:101, dep:0,arr:1,dep_date:'02:30:00',arr_date:'22:30:00'},
    {id:102, dep:0,arr:1,dep_date:'02:30:00',arr_date:'16:30:00'},
    {id:103, dep:0,arr:1,dep_date:'02:30:00',arr_date:'22:30:00'}
    ]

var date_classification_array = [
    {id:1,beg_time_period:'18:00:00',end_time_period:'24:00:00',color:'#f1eef6'},
    {id:2,beg_time_period:'12:00:00',end_time_period:'18:00:00',color:'#bdc9e1'},
    {id:3,beg_time_period:'06:00:00',end_time_period:'12:00:00',color:'#74a9cf'},
    {id:4,beg_time_period:'00:00:00',end_time_period:'06:00:00',color:'#0570b0'}
  ]

//var object_svg = create_city_flow_objects(city_list,flow_list,date_classification_array)

 var arc = fetch(".sources/data_sous_district_arc.json")
  .then(response => response.json())
  .then(json => console.log(json));

create_leaf(arc,"test");
create_city(object_svg.city_object_list,"test");
