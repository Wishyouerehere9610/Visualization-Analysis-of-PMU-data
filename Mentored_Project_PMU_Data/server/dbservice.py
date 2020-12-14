import datetime
import logging
import os
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, Response, jsonify
import sqlalchemy

def get_regions(db):
    with db.connect() as conn:
        regions = conn.execute(
            "SELECT region FROM regions"
        ).fetchall()

        if regions:
            got_regions = jsonify({'result': [dict(row) for row in regions]})
        else:
            got_regions = 'No Regions in DB'

    return got_regions



def get_bus_details(db,bus_name,start_time=0,end_time=0.3):
    with db.connect() as conn:
        bus_name_pu = bus_name+ " V pu"
        bus_name_angle = bus_name+ " V angle"
        bus_name_freq = bus_name+ " Frequency"
        bus_table = conn.execute(
            "SELECT * FROM bus_table where Bus='{}'".format(bus_name_pu)
        ).fetchone()

        print("********"+bus_table.Table)
        table = bus_table.Table[:-1]
        query = "SELECT {},`{}`,`{}`,`{}` FROM {} where time>={} AND time<={}".format("Time",bus_name_pu,bus_name_angle,bus_name_freq,table,start_time,end_time)
        bus_details = conn.execute(
            query
            ).fetchall()


        if bus_details:
            res = jsonify({'result': [dict(row) for row in bus_details]})
        else:
            res = 'No Bus Details in DB'
        # # for row in bus_table:
        # #     print("*****"+row+"*****")
        # returned_row = jsonify(bus_table)

    return res


def get_bus_neighbours(db,bus_name):
    with db.connect() as conn:
        print("bus id", bus_name)
        bus_id = conn.execute(
            "SELECT * from buses where name='{}'".format(bus_name)
        ).fetchone()
        print("bus id 0 ", bus_id)
        bus_id = bus_id[0]

        nbrs = set()
        qry = "SELECT * from pmu_lines where `from`={} or `to`={}".format(bus_id,bus_id)
        neighbour_rows = conn.execute(qry).fetchall()
        print("ID",bus_id)
        print("row",neighbour_rows)

        for row in neighbour_rows:
            if row[1] == bus_id:
                nbrs.add(row[2])
            else:
                nbrs.add(row[1])
            # nbrs.add(neighbour_rows[2])
        print(nbrs)
        mster_qry = "SELECT * from buses where `﻿id`={}".format(bus_id)
        for nbr in nbrs:
            mster_qry+=" or `﻿id`={}".format(nbr)
        all_buses= conn.execute(mster_qry).fetchall()
        res = {'result': [dict(row) for row in all_buses]}
        all_bus_names = set()
        for bus_row in all_buses:
            all_bus_names.add(bus_row[1])

        print(list(all_bus_names))
        return res,all_bus_names







def get_bus_and_nbrs_details(db,bus_name,start_time=0,end_time=0.3):

    bus_locations,all_bus_names=get_bus_neighbours(db,bus_name)
    res={}
    # res["Time Data"]={}
    # res["Location Data"]={}
    res={}
    with db.connect() as conn:
        for bus_name in all_bus_names:
            bus_name = "Bus "+bus_name
            bus_name_pu = bus_name+ " V pu"
            bus_name_angle = bus_name+ " V angle"
            bus_name_freq = bus_name+ " Frequency"
            bus_table = conn.execute(
                "SELECT * FROM bus_table where Bus='{}'".format(bus_name_pu)
            ).fetchone()

            print("********"+bus_table.Table)
            table = bus_table.Table[:]
            query = "SELECT {},`{}`,`{}`,`{}` FROM {} where time>={} AND time<={}".format("Time",bus_name_pu,bus_name_angle,bus_name_freq,table,start_time,end_time)
            bus_details = conn.execute(
                query
                ).fetchall()


            V_list = []
            angle_list = []
            freq_list = []
            time_list = []
            for row in bus_details:
                V_list.append(row[1])
                angle_list.append(row[2])
                freq_list.append(row[3])
                time_list.append(row[0])


            # print(V_list)
            # print(angle_list)
            V_list = np.array(V_list)
            angle_list = np.array(angle_list)
            freq_list = np.array(freq_list)
            time_list = np.array(time_list)
            Va = V_list * np.cos(angle_list)
            Vb = V_list * np.cos(angle_list+120)
            Vc = V_list * np.cos(angle_list+240)
            # print(Va,Vb,Vc)
            V=np.stack((Va,Vb,Vc,freq_list,time_list),axis=1)
            res.update(dict({bus_name:[{bus_name+" Va": row[0], bus_name+" Vb": row[1], bus_name+" Vc": row[2],bus_name+" Frequency":row[3],"Time":row[4]} for row in V]}))




            # # for row in bus_table:
            # #     print("*****"+row+"*****")
            # returned_row = jsonify(bus_table)
    # res["Location Data"].update(bus_locations)



    return jsonify(res)




def get_v(db,area):
    pu_post=' V pu'
    angle_post=' V angle'
    freq_post=' Frequency'

    with db.connect() as conn:

        table_name=conn.execute("select * from bus_table where bus='"+area+pu_post+"';").fetchone()[1]
        values_db = np.array(conn.execute("SELECT `"+area+pu_post+"`, `"+area+angle_post+"`, `"+area + freq_post + "`, time "+" from "+table_name+";").fetchall())

        pu_values = values_db[:, 0]
        angle_values = values_db[:, 1]
        freq_values = values_db[:, 2]
        time_values = values_db[:, 3]

        #pu_values=np.array(conn.execute("SELECT `"+area+pu_post+"` from "+table_name+";").fetchall()).flatten()
        #angle_values=np.array(conn.execute("SELECT `"+area+angle_post+"` from "+table_name+";").fetchall()).flatten()
        #freq_values = np.array(conn.execute("SELECT `" + area + freq_post + "` from "+table_name+";").fetchall()).flatten()
        #time_values = np.array(conn.execute("SELECT time from " + table_name + ";").fetchall()).flatten()

    Va = pu_values * np.cos(angle_values)
    Vb = pu_values * np.cos(angle_values+120)
    Vc = pu_values * np.cos(angle_values+240)

    V=np.stack((Va,Vb,Vc,freq_values,time_values),axis=1)

    return V

def fft(V,seconds_start,seconds_window):


    sp = np.zeros((V.shape[1], int((seconds_window * 15) + 1)))  # Create empty array in which the FFT for all signals will be stored
    ac = np.zeros((V.shape[1], 15))  # Create empty array in which the autocorrelation for all signals will be stored


    for i in range(V.shape[1]):  # Process one row of V (i.e. one PMU) at a time
        sp[i, :] = np.fft.rfft(V[int(seconds_start * 30):int((seconds_start + seconds_window) * 30), i] - np.mean(
            V[int(seconds_start * 30):int((seconds_start + seconds_window) * 30), i]))
        ser = pd.Series(V[int(seconds_start * 30):int((seconds_start + seconds_window) * 30), i])
        ac[i, :] = [ser.autocorr(lag=j + 1) for j in range(15)]
    x_f = np.fft.rfftfreq(len(V[int(seconds_start * 30):int((seconds_start + seconds_window) * 30), i]), 1 / 30)

    return sp,ac,x_f

def get_buses(db):
    with db.connect() as conn:

        buses= conn.execute("select substring(bus,1,length(bus)-5) from bus_table where bus like '%pu';").fetchall()

    return buses

def V_time(db,area,second_start,second_end):
    pu_post = ' V pu'
    angle_post = ' V angle'
    freq_post = ' Frequency'

    with db.connect() as conn:
        table_name = conn.execute("select * from bus_table where bus='" + area + pu_post + "';").fetchone()[1]
        pu_values = np.array(
            conn.execute("SELECT `" + area + pu_post + "` from " + table_name + " where time between"+second_start+" and "+second_end+";").fetchall()).flatten()
        angle_values = np.array(
            conn.execute("SELECT `" + area + angle_post + "` from " + table_name + "where time between"+second_start+" and "+second_end+";").fetchall()).flatten()
        freq_values = np.array(
            conn.execute("SELECT `" + area + freq_post + "` from " + table_name + "where time between"+second_start+" and "+second_end+";").fetchall()).flatten()
    Va = pu_values * np.cos(angle_values)
    Vb = pu_values * np.cos(angle_values + 120)
    Vc = pu_values * np.cos(angle_values + 240)

    V = np.stack((Va, Vb, Vc), axis=1)
    V_json=jsonify({"result": [{"Va": row[0], "Vb": row[1], "Vc": row[2]} for row in V]})

    return V_json


def get_lines(db):
    with db.connect() as conn:

        lines= conn.execute("select * from pmu_lines;").fetchall()

    return lines

def get_zones(db):
    with db.connect() as conn:

        zones= conn.execute("select * from zones;").fetchall()

    return zones


# get_bus_neighbours('ABBOTT 0')
