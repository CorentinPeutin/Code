# -*- coding: utf-8 -*-
"""
Created on Tue Janv 01 14:02:05 2021

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

def creation_json (sql, nom_fich, type_objet,cur, nb_class) :
    data = []
    raw = cur.fetchone() # Une ligne de la requete

    # Initialisation du Json
    id_path = raw[0]
    sub_nb_trip = raw[1]
    id_dep, id_arr = raw[2], raw[3]
    id_class = raw[4]
    x1,y1 = raw[5],raw[6]
    x2,y2 = raw[7],raw[8]
    cx,cy = coeffs_x_y(x1,y1,x2,y2)
    trip_template = [{'id':i, 'nb':0} for i in range(nb_class)]

    json_group = {'id':id_path,
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
                  'nb_trip':0, # A remplir suivant la somme des nb_trips de listes
                  'list_graph_trip':copy.deepcopy(trip_template)}

    id_start_end = (id_dep, id_arr)

    while raw:
        print(raw)
        sub_nb_trip = raw[1]
        id_dep, id_arr = raw[2], raw[3]

        if id_start_end != (id_dep,id_arr):
            id_start_end = (id_dep,id_arr)
            data.append(json_group)

            id_path = raw[0]
            id_class = raw[4]
            x1,y1 = raw[5],raw[6]
            x2,y2 = raw[7],raw[8]
            cx,cy = coeffs_x_y(x1,y1,x2,y2)

            json_group = {'id':id_path,
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
                          'nb_trip':0, # A remplir suivant la somme des nb_trips de listes
                          'list_graph_trip':copy.deepcopy(trip_template)}

        json_group['list_graph_trip'][id_class-1]['nb'] = sub_nb_trip
        json_group['nb_trip'] += sub_nb_trip

        print(json_group)
        raw = cur.fetchone()

    with open(nom_fich + ".json","w") as write_file :
        json.dump(data, write_file)

hours_stamp = [0,6,12,16,24]

sql = ""

for i in range(len(hours_stamp)-1):

    sql+= """SELECT id,COUNT(id) as nombre,start_iris,end_iris, """+str(i+1)+""" as classe, start_longitude, end_longitude, start_latitude, end_longitude
            FROM mise_en_prod.jointure_iris
            WHERE date_part('hour', to_timestamp(startsecond)) BETWEEN """+str(hours_stamp[i])+""" AND """+str(hours_stamp[i+1])+"""
            GROUP BY id,start_iris,end_iris, start_longitude, start_latitude, end_longitude, end_latitude
            UNION\n"""

sql = sql[:-8 ] + "\nORDER BY start_iris,end_iris, classe "

print(sql)
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


creation_json(sql,nom_fich,type_objet,cur,4)
