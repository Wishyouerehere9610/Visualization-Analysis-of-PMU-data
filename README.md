# Mentored_Project_PMU_Data

## NOTE to TA/Grader: Before connecting to DB, kindly inform our team to start the Cloud SQL DB instance as its stopped when not in use due to the cost incurred for continuously running the instance.

## Steps to setup and run flask server locally by connecting to Cloud SQL DB:

  1. Install the proxy as mentioned in link : https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#macos-64-bit

  2. Run the command (if windows no need for ‘./’ for running an executable ):
        
        ./cloud_sql_proxy -instances=<INSTANCE_CONNECTION_NAME>=tcp:3306 \
          -credential_file=<PATH_TO_KEY_FILE> &

  *INSTANCE_CONNECTION_NAME = “lateral-raceway-295218:us-central1:mysql”*
  *PATH_TO_KEY_FILE = local path to json key file (starting with 'lateral-raceway') added to git repo root folder*

  3. Run flask server: **python main.py** (python3 if pointing to version 2)

  ### NB: In case anyone gets *moduleNotFoundError*, Please install that module using pip3 command/whatever tool you are comfortable with.
  ### If anyone changes the tcp port from *3306* to something else, make sure to update line # *81* in *main.py*


## Steps to run visualization tool locally:
  * cd client
  * python -m http.server
  * open your browser and point to url: localhost:8000
### NB: All CSV data related to map has been added to *lpdata* folder of *client* folder. Do not remove it, else map won't be generated.
### If your flask server is not running on *http://127.0.0.1:5000*, then update line # 6 of *client/script/chart.js* file to your flask url

## Endpoint 1. [/bus_details]
To return the Details of a bus in a given time range

### Request Example (Java_Script):

var data = JSON.stringify({
  "bus_name": "Bus SILVER 4",
  "start_time": "0",
  "end_time": "0.6"
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://127.0.0.1:5000/bus_details");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("Postman-Token", "56e61bb0-e0ba-4100-b728-b06ebc57e37a");

xhr.send(data);





## Endpoint 2. [/bus_and_nbrs_details]
To return the Voltage details of a bus along with it's neighbours in a given time range.


### Request Example (Java_Script):

var data = JSON.stringify({
  "bus_name": "AUSTIN 27 0",
  "start_time": "0",
  "end_time": "0.6"
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://127.0.0.1:5000/bus_and_nbrs_details");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("Postman-Token", "b4718c52-834a-406b-a36f-980dc10c384e");

xhr.send(data);



## Endpoint 3. [/bus_nbr_locations]

To get the coordinates of a bus and it's neighbours

### Request Example (Java_Script):

var data = JSON.stringify({
  "bus_name": "ROUND ROCK 4 0"
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://127.0.0.1:5000/bus_nbr_locations");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("Postman-Token", "5cf40efd-9515-4428-9676-03c49aceca08");

xhr.send(data);

### Response Example:
Folder:
[sample_api_outputs/bus_nbr_locations.json]



## Endpoint 4. [/fft_all_nbrs]

To get fft values for a bus and it's neighbours from a starting time for a particular window length.

### Request Example (Java_Script):

var data = JSON.stringify({
  "bus_name": "ROUND ROCK 4 0"
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://127.0.0.1:5000/fft_all_nbrs");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("Postman-Token", "162bd3db-e671-4da4-a21b-285bfdda9daf");

xhr.send(data);
