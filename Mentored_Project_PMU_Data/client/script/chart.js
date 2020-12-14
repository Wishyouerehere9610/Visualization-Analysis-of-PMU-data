// Smaple data for Bus SILVER 4

var margin = {top: 20, right: 20, bottom: 50, left: 50};
var linewidth =650 - margin.left - margin.right;
var lineheight = 370 - margin.top - margin.bottom;
var baseurl = "http://127.0.0.1:5000";
var allData;
var opts = {
  lines: 10, // The number of lines to draw
  length: 21, // The length of each line
  width: 9, // The line thickness
  radius: 13, // The radius of the inner circle
  scale: 1.2, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 0.9, // Rounds per second
  rotate: 57, // The rotation offset
  animation: 'spinner-line-shrink', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#44c548', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex:  9999, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'relative', // Element positioning
};

var target = document.getElementById("spinner");
var elm = document.getElementById("blurback");
var spinner = new Spinner(opts);

document.addEventListener('DOMContentLoaded', function() {
  spinner.spin(target);
  elm.style.display = 'block';
  voltage_svg = d3.select("#time_voltage").append("svg")
      .attr("width", 900)
      .attr("height", lineheight + margin.top + margin.bottom+7)
      .append("g")
      .attr("transform",
          "translate(" + 100 + "," + 40 + ")");

  fft_svg = d3.select("#frequency_fft").append("svg")
      .attr("width", 900)
      .attr("height", lineheight + margin.top + margin.bottom+10)
      .append("g")
      .attr("transform",
          "translate(" + 100 + "," + 40 + ")");
  graph_svg = d3.select("#neighbor_graph").append("svg")
      .attr("width",200)
      .attr("height",150)
      .append("g");
    console.log('trace:loadInit');
    version = "/api/v1";
    // Read current values from the HTML page and store in a JS object
    params = {
              bus_name: localStorage.getItem('bus_name'),
              start_time: 0,
              end_time: 0.3,
              phase: 0
            };
    neighborParams = {
              bus_name: localStorage.getItem('bus_name')
            };

    console.log(localStorage.getItem('bus_name'));

    // Load both files before doing anything else
    Promise.all([apicall(version+"/fft_all_nbrs", params, "POST"),
                apicall(version+"/bus_nbr_locations",neighborParams,"POST")])
            .then(function(values){
      allData = values[0];
      neighborLocations = values[1];
      console.log("Neighbor Locations")
      console.log(neighborLocations['result'])
      Buses=(Object.keys(allData['voltage']))
      console.log(allData['voltage']);
      console.log(allData['fft']);
      console.log(Buses);

      var dropDown = d3.select("#busname");

      dropDown.selectAll("option")
      .data(Buses)
      .enter()
      .append("option")
      .text(function(d){return d;})
      .attr("value",function(d){return d;});

      drawGraph(neighborLocations);
      volt_draw(allData);
      fft_draw(allData);
      elm.style.display = 'none';
      spinner.stop();

    })


  });

function drawVoltChart() {


  spinner.spin(target);
  elm.style.display = 'block';
  params = {
            bus_name: localStorage.getItem('bus_name'),
            start_time: parseFloat(document.getElementById("starttime").value),
            end_time: parseFloat(document.getElementById("endtime").value),
            phase: getPhaseVal(document.getElementById("phase").value)
          };
    Promise.all([apicall(version+"/fft_all_nbrs", params, "POST")])
            .then(function(values){
      allData = values[0];
      Buses=(Object.keys(allData['voltage']))
      fft_svg.selectAll('*').remove();
      volt_draw(allData);
      fft_draw(allData);
      spinner.stop();
      elm.style.display = 'none';

    })


}

function getPhaseVal(param) {

  if(param == ' Va')
    return 0;
  else if (param == ' Vb')
    return 1;
  else
    return 2;

}

function drawFreqChart() {
    // d3.select("#frequency_fft").remove();
    fft_draw(allData);
}

  async function apicall(end_point, params, type) {

    const url = baseurl+end_point;

    const response = await fetch(url, {
      method: type,
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(params)
    })
    .then(json)
    .then(function (data) {
      console.log('Request succeeded with JSON response', data);
      return data;
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });

    return await response;


  }


  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
  }

  function json(response) {
    return response.json()
  }


  function drawChart() {
    volt_draw(allData);
    fft_draw(allData);
  }
  function drawGraph(neighborLocations){
    graphDraw(neighborLocations)
  }
