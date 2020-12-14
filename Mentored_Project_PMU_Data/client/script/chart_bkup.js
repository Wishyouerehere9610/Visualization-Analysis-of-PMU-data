// Smaple data for Bus SILVER 4

var margin = {top: 20, right: 20, bottom: 50, left: 50};
var linewidth =650 - margin.left - margin.right;
var lineheight = 370 - margin.top - margin.bottom;
var baseurl = "http://127.0.0.1:5000";
var VoltData;
var FftData;
var voltage_svg;
var fft_svg;


document.addEventListener('DOMContentLoaded', function() {

  voltage_svg = d3.select("#time_voltage").append("svg")
      .attr("width", linewidth + margin.left + margin.right)
      .attr("height", lineheight + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + 74 + "," + 33 + ")");

  fft_svg = d3.select("#frequency_fft").append("svg")
      .attr("width", linewidth + margin.left + margin.right)
      .attr("height", lineheight + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + 74 + "," + 33 + ")");
  loadInit();

});


function loadInit() {

    console.log('trace:loadInit');
    version = "/api/v1";
    // Read current values from the HTML page and store in a JS object
    params = {
              bus_name: localStorage.getItem('bus_name'),
              start_time: 0,
              end_time: 0.3,
              phase: 0,
              seconds_window: 2
            };

    console.log(localStorage.getItem('bus_name'));


    Promise.allSettled([apicall(version+"/bus_nbr_locations", params, "POST"),
                apicall(version+"/bus_and_nbrs_details", params, "POST"),
                apicall(version+"/fft_all_nbrs", params, "POST")])
    .then(function(values){
      console.log("Waiting.....");
      console.log(values);
      locData = values[0].value;
      VoltData = values[1].value;
      FftData = values[2].value;
      //Buses=(Object.keys(locData, function(d){return d.name;}))
      Buses=(Object.keys(VoltData))
      console.log(Buses);

      var dropDown = d3.select("#busname");

      var options = dropDown.selectAll("option")
          .data(Buses)
          .enter()
          .append("option");
          options.text(function(d) {
          return d;
          })
          .attr("value", function(d) {
            return d;
          });

      console.log(Buses);
      console.log(VoltData);
      console.log(FftData);
    });

}

d3.select("#Button1").on('click', function(){
    console.log(VoltData);
    volt_draw(VoltData);

 });

 d3.select("#Button2").on('click', function(){
    console.log(FftData);
    fft_draw(FftData);
 });


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

  // fetch(url, {
  //                 method: type,
  //                 body: JSON.stringify(params),
  //                 headers: new Headers({"content-type": "application/json"})
  // }).then(response => {
  //     if(response.status != 200) {
  //         console.log(`Looks like there was a problem. Status code: ${response.status}`)
  //         return;
  //     }
  //     response.json().then(data => {
  //         console.log(data);
  //         // call drawtSNE() to update the scatterplot
  //         return data;
  //         //initBuses(data);
  //     })
  // })
  // .catch(error => {
  //     console.log(`Fetch error: ${error}`);
  // });

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
