# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
import logging
import os
from flask import Flask, render_template, request, Response, jsonify
import sqlalchemy
import dbservice as dbs
import numpy as np
import pandas as pd
import json
from flask_cors import CORS, cross_origin

app = Flask(__name__)
#app.config['SECRET_KEY'] = 'escapeLight3241'
app.config['CORS_HEADERS'] = 'Content-Type'
#cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app, resources=r'/api/*')
logger = logging.getLogger()


def init_connection_engine():
    db_config = {
        # [START cloud_sql_mysql_sqlalchemy_limit]
        # Pool size is the maximum number of permanent connections to keep.
        "pool_size": 5,
        # Temporarily exceeds the set pool_size if no connections are available.
        "max_overflow": 2,
        # The total number of concurrent connections for your application will be
        # a total of pool_size and max_overflow.
        # [END cloud_sql_mysql_sqlalchemy_limit]

        # [START cloud_sql_mysql_sqlalchemy_backoff]
        # SQLAlchemy automatically uses delays between failed connection attempts,
        # but provides no arguments for configuration.
        # [END cloud_sql_mysql_sqlalchemy_backoff]

        # [START cloud_sql_mysql_sqlalchemy_timeout]
        # 'pool_timeout' is the maximum number of seconds to wait when retrieving a
        # new connection from the pool. After the specified amount of time, an
        # exception will be thrown.
        "pool_timeout": 30,  # 30 seconds
        # [END cloud_sql_mysql_sqlalchemy_timeout]

        # [START cloud_sql_mysql_sqlalchemy_lifetime]
        # 'pool_recycle' is the maximum number of seconds a connection can persist.
        # Connections that live longer than the specified amount of time will be
        # reestablished
        "pool_recycle": 1800,  # 30 minutes
        # [END cloud_sql_mysql_sqlalchemy_lifetime]

    }

    if os.environ.get("CLOUD_SQL_CONNECTION_NAME"):
        return init_unix_connection_engine(db_config)
    else:
        return init_tcp_connection_engine(db_config)


def init_tcp_connection_engine(db_config):
    # [START cloud_sql_mysql_sqlalchemy_create_tcp]
    # Remember - storing secrets in plaintext is potentially unsafe. Consider using
    # something like https://cloud.google.com/secret-manager/docs/overview to help keep
    db_user = "root" #os.environ["DB_USER"]
    db_pass = "root1234" #os.environ["DB_PASS"]
    db_name = "dv" #os.environ["DB_NAME"]
    db_host = "127.0.0.1:3306" #os.environ["DB_HOST"]


    # Extract host and port from db_host
    host_args = db_host.split(":")
    db_hostname, db_port = host_args[0], int(host_args[1])

    pool = sqlalchemy.create_engine(
        # Equivalent URL:
        # mysql+pymysql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name>
        sqlalchemy.engine.url.URL(
            drivername="mysql+pymysql",
            username=db_user,  # e.g. "my-database-user"
            password=db_pass,  # e.g. "my-database-password"
            host=db_hostname,  # e.g. "127.0.0.1"
            port=db_port,  # e.g. 3306
            database=db_name,  # e.g. "my-database-name"
        ),
        **db_config
    )
    # [END cloud_sql_mysql_sqlalchemy_create_tcp]

    return pool


def init_unix_connection_engine(db_config):
    # [START cloud_sql_mysql_sqlalchemy_create_socket]
    # Remember - storing secrets in plaintext is potentially unsafe. Consider using
    # something like https://cloud.google.com/secret-manager/docs/overview to help keep
    # secrets secret.
    db_user = os.environ["DB_USER"]
    db_pass = os.environ["DB_PASS"]
    db_name = os.environ["DB_NAME"]
    db_socket_dir = os.environ.get("DB_SOCKET_DIR", "/cloudsql")
    cloud_sql_connection_name = os.environ["CLOUD_SQL_CONNECTION_NAME"]

    pool = sqlalchemy.create_engine(
        # Equivalent URL:
        # mysql+pymysql://<db_user>:<db_pass>@/<db_name>?unix_socket=<socket_path>/<cloud_sql_instance_name>
        sqlalchemy.engine.url.URL(
            drivername="mysql+pymysql",
            username=db_user,  # e.g. "my-database-user"
            password=db_pass,  # e.g. "my-database-password"
            database=db_name,  # e.g. "my-database-name"
            query={
                "unix_socket": "{}/{}".format(
                    db_socket_dir,  # e.g. "/cloudsql"
                    cloud_sql_connection_name)  # i.e "<PROJECT-NAME>:<INSTANCE-REGION>:<INSTANCE-NAME>"
            }
        ),
        **db_config
    )
    # [END cloud_sql_mysql_sqlalchemy_create_socket]

    return pool


# This global variable is declared with a value of `None`, instead of calling
# `init_connection_engine()` immediately, to simplify testing. In general, it
# is safe to initialize your database connection pool when your script starts
# -- there is no need to wait for the first request.
db = None

@app.before_first_request
def create_conn():
    global db
    db = db or init_connection_engine()


@app.route('/', methods=['GET'])
def home():

    return "<h1>PMU Data Visualization</h1><p>Flask server is up and running.....</p>"

@app.route('/api/v1/regions', methods=['GET'])
@cross_origin(allow_headers=['Content-Type'])
def regions():
    return dbs.get_regions(db)


@app.route('/api/v1/bus_details', methods=['POST'])
@cross_origin(allow_headers=['Content-Type'])
def bus_details():

    data = request.get_json()
    print(data)

    return dbs.get_bus_details(db,data['bus_name'],float(data["start_time"]),float(data["end_time"]))



@app.route('/api/v1/bus_and_nbrs_details', methods=['POST'])
@cross_origin(allow_headers=['Content-Type'])
def bus_and_nbrs_details():
    data = request.get_json()

    print("End Time", data["end_time"])
    print(data,"2@@@@@@@")

    return dbs.get_bus_and_nbrs_details(db,data['bus_name'],float(data["start_time"]),float(data["end_time"]))



@app.route('/api/v1/bus_nbr_locations', methods=['POST'])
@cross_origin(allow_headers=['Content-Type'])
def bus_nbr_locations():
    data = request.get_json()

    res,all_bus_names=dbs.get_bus_neighbours(db,data['bus_name'])

    return jsonify(res)




@app.route('/api/v1/fft_all_nbrs',methods=['POST'])
@cross_origin(allow_headers=['Content-Type'])
def fft_all_nbrs():
    global column_names
    # bus_name='MANOR 0 V pu'
    data = request.get_json()
    bus_name = data['bus_name']
    loc,all_buses = dbs.get_bus_neighbours(db,bus_name)
    print(loc,all_buses)
    res = {}
    # res["Volt"] = {}
    # res["FFT"] = {}
    seconds_window = float(data["end_time"])  # Time window over which to perform FFT
    seconds_start = float(data["start_time"])  # Time in seconds at which you want to perform FFT. If you want FFt of the first 2 seconds of data, set seconds_start=0. This calculates from the 3610-3612th seconds
    flag=1

    for bus in all_buses:
        area = "Bus "+bus

        if(flag):
            temp=dbs.get_v(db,area)
            V=temp[:,:3]
            Voltage=temp[int(seconds_start * 30):int((seconds_start + seconds_window) * 30),:]
            flag=0
        else:
            temp=dbs.get_v(db,area)
            V=np.concatenate((V,temp[:,:3]),axis=1)
            Voltage=np.concatenate((Voltage,temp[int(seconds_start * 30):int((seconds_start + seconds_window) * 30),:]),axis=1)


        # v_json = dict({area:[{area+" Va": row[0], area+" Vb": row[1], area+" Vc": row[2],area+" Frequency":row[3],"Time":row[4]} for row in V]})
        # res["Volt"].update(v_json)
    print(V)
    sp,ac,x_f=dbs.fft(V, seconds_start, seconds_window)

    V_label=[" Va"," Vb"," Vc"]


    i=0
    res["fft"]={}
    res["voltage"]={}
    res_fft=res["fft"]
    res_v=res["voltage"]
    for bus in (all_buses):
        area = "Bus " + bus
        res_fft[area] = {}
        res_v[area]={}
        for j in range(3):
            fft_values = np.stack((sp[(i*3)+j,:].T.flatten(), x_f), axis=1)
            res_fft[area].update({V_label[j]:[{"value": row[0], "Freq": row[1]} for row in fft_values]})
        voltage_values=Voltage[:,(i*5):((i*5)+5)]
        res_v.update({area:[{area+" Va": row[0], area+" Vb": row[1], area+" Vc": row[2],area+" Frequency":row[3],"Time":row[4]} for row in voltage_values]})
        i+=1

    return jsonify(res)

@app.route('/api/v1/fft_V_nbrs',methods=['POST'])
@cross_origin(allow_headers=['Content-Type'])
def fft_V_nbrs():
    global column_names
    # bus_name='MANOR 0 V pu'
    data = request.get_json()
    bus_name = data['bus_name']
    loc,all_buses = dbs.get_bus_neighbours(db,bus_name)
    print(loc,all_buses)
    res = {}
    # res["Volt"] = {}
    # res["FFT"] = {}
    seconds_window = float(data["end_time"])  # Time window over which to perform FFT
    seconds_start = float(data["start_time"])  # Time in seconds at which you want to perform FFT. If you want FFt of the first 2 seconds of data, set seconds_start=0. This calculates from the 3610-3612th seconds
    flag=1
    for bus in all_buses:
        area = "Bus "+bus

        if(flag):
            V=dbs.get_v(db,area)[:,:3]
            print("init shape",V.shape)
            flag=0
        else:
            temp=dbs.get_v(db,area)[:,:3]
            print("temp shape",temp.shape)
            V=np.concatenate((V,temp),axis=1)
            print("V shape",V.shape)

        # v_json = dict({area:[{area+" Va": row[0], area+" Vb": row[1], area+" Vc": row[2],area+" Frequency":row[3],"Time":row[4]} for row in V]})
        # res["Volt"].update(v_json)
    sp,ac,x_f=dbs.fft(V, seconds_start, seconds_window)

    V_label=[" Va"," Vb"," Vc"]
    i=0
    for bus in (all_buses):
        area = "Bus " + bus
        res[area] = {}
        for j in range(3):
            fft_values = np.stack((sp[i+j,:].T.flatten(), x_f), axis=1)
            res[area].update({V_label[j]:[{"value": row[0], "Freq": row[1]} for row in fft_values]})
        i+=3

    return jsonify(res)

if __name__ == '__main__':
	app.run(debug=True)
