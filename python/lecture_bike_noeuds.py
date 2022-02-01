# -*- coding: utf-8 -*-
"""
Created on Tue Dec 14 14:02:05 2021

@author: Formation
"""

import psycopg2
import json
import math
import copy

def coeffs_x_y(x1,y1,x2,y2):
    # Calcul des coefficients
    trip_r_coeff = 5 # param du prof
    
    angle = math.pi - math.atan(abs(y2-y1)/abs(x2-x1))
    abs_cx = math.sin(angle)*trip_r_coeff
    abs_cy = math.cos(angle)*trip_r_coeff
    
    if (x2-x1 > 0):
        cy = -abs_cy
    else : cy = abs_cy
    
    if (y2-y1 > 0):
        cx = -abs_cx
    else : cx = abs_cx
    
    return cx,cy

def creation_json (sql, nom_fich, type_objet, nb_class=1) :
    cur = conn.cursor()
    cur.execute(sql)
    list_arc = []
    dict_node = {}
    raw = cur.fetchone()
    
    id_path = raw[0]
    id_start_end = (raw[2],raw[3])
    id_dep, id_arr = raw[2], raw[3]
    x1,y1 = raw[5],raw[6]
    x2,y2 = raw[7],raw[8]
    cx,cy = coeffs_x_y(x1,y1,x2,y2)   
    trip_template = [{'id':i, 'nb':0} for i in range(nb_class)]
    
    json_arc = {'id':id_path,
                'id_dep':id_dep,
                'id_arr':id_arr,
                'x1':x1,
                'y1':y1,
                'x2':x2,
                'y2':y2,
                'xc_origin':min(x2,x1) + abs(x2-x1)/2,
                'yc_origin':min(y2,y1) + abs(y2-y1)/2,
                'xc_coeff':cx,
                'yc_coeff':cy,
                'nb_trip':0,
                'list_graph_trip':copy.deepcopy(trip_template)}
    
    while raw:
        
        id_start_end = (raw[2],raw[3])    
        
        if id_start_end != (id_dep,id_arr):
            
            id_path = raw[0]
            id_dep, id_arr = raw[2], raw[3]
            
            x1,y1 = raw[5],raw[6]
            x2,y2 = raw[7],raw[8]
            cx,cy = coeffs_x_y(x1,y1,x2,y2)
            
            list_arc.append(json_arc)
            json_arc = {'id':id_path,
                        'id_dep':id_dep,
                        'id_arr':id_arr,
                        'x1':x1,
                        'y1':y1,
                        'x2':x2,
                        'y2':y2,
                        'xc_origin':min(x2,x1) + abs(x2-x1)/2,
                        'yc_origin':min(y2,y1) + abs(y2-y1)/2,
                        'xc_coeff':cx,
                        'yc_coeff':cy,
                        'nb_trip':0,
                        'list_graph_trip':copy.deepcopy(trip_template)}

        nb_trip = raw[1]
        id_class = raw[4]            
        
        json_arc['list_graph_trip'][id_class]['nb'] = nb_trip
        json_arc['nb_trip'] += nb_trip
        
        for i in range(2):
            x,y = ((x1,y1),(x2,y2))[i]
            direction = ('dep','arr')[i]
            id_node = (id_dep,id_arr)[i]
            
            try:
                dict_node[id_node]
            except KeyError:
                dict_node[id_node] = {'id':id_node,
                                      'x':x,
                                      'y':y,
                                      'a_coeff':200,
                                      'nb_trip_dep':0,
                                      'nb_trip_arr':0,
                                      'list_graph_dep':copy.deepcopy(trip_template),
                                      'list_graph_arr':copy.deepcopy(trip_template)}
                
            dict_node[id_node]['nb_trip_'+direction] += nb_trip
            dict_node[id_node]['list_graph_'+direction][id_class]['nb'] += nb_trip
        
        raw = cur.fetchone()
    
    with open(nom_fich + "_arc.json","w") as write_file :
        json.dump(list_arc, write_file)
    with open(nom_fich + "_node.json","w") as write_file:
        json.dump(list(dict_node.values()), write_file)

hours_stamp = [0,6,12,16,24]

sql = ""

for i in range(len(hours_stamp)-1):

    sql+= """SELECT id,COUNT(id) as nombre,start_iris,end_iris, """+str(i)+""" as classe, start_longitude, start_latitude, end_longitude, end_latitude
            FROM mise_en_prod.jointure_iris
            WHERE date_part('hour', to_timestamp(startsecond)) BETWEEN """+str(hours_stamp[i])+""" AND """+str(hours_stamp[i+1])+"""
            GROUP BY id,start_iris,end_iris, start_longitude, start_latitude, end_longitude, end_latitude
            UNION\n"""

sql = sql[:-8 ] + "\nORDER BY start_iris,end_iris, classe "
nom_fich = "data_sous_district"
type_objet = "sous_district"

# Connection à la BDD
conn = psycopg2.connect(
    user = "postgres",
    password = "postgres",
    host = "HP1706W117",
    port = "5432",
    database = "bike"
)
# Execution de la requete 
cur = conn.cursor()
cur.execute(sql)

creation_json(sql,nom_fich,type_objet,4)