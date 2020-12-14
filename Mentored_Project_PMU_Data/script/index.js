// Smaple data for Bus SILVER 4

var margin = {top: 20, right: 20, bottom: 50, left: 50};
var linewidth =650 - margin.left - margin.right;
var lineheight = 370 - margin.top - margin.bottom;

document.addEventListener('DOMContentLoaded', function() {
    voltage_svg = d3.select("#time_voltage").append("svg")
        .attr("width", 900)
        .attr("height", lineheight + margin.top + margin.bottom+7)
        .append("g")
        .attr("transform",
            "translate(" + 74 + "," + 33 + ")");

    fft_svg = d3.select("#frequency_fft").append("svg")
        .attr("width", 900)
        .attr("height", lineheight + margin.top + margin.bottom+10)
        .append("g")
        .attr("transform",
            "translate(" + 74 + "," + 33 + ")");      
  
    // Load both files before doing anything else
    Promise.all([d3.json('sample_api_outputs/voltage_fft.json')])
            .then(function(values){
      all_data = values[0];
      Buses=(Object.keys(all_data['voltage']))

    //create drop down
    var dropDown = d3.select(".control").append("select")
                                    .attr("id","busname")

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

    })
    
    d3.select("#Button1").on('click', function(){
        volt_draw(all_data);
        
     });

     d3.select("#Button2").on('click', function(){
        fft_draw(all_data);
     });
  
  });







