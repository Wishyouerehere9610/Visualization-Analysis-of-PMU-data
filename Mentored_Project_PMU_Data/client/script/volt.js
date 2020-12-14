

function volt_draw(data){
    voltage_svg.selectAll('*').remove();
    var phase=d3.select("#phase").node().value;
    var data=data['voltage'][d3.select("#busname").node().value];
    var bus_phase=d3.select("#busname").node().value+d3.select("#phase").node().value;


    // parse the date / time
    var parseTime = d3.timeParse("%Y");

    // set the ranges
    var x = d3.scaleLinear().range([0, linewidth]);
    var y = d3.scaleLinear().range([lineheight, 0]);

    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(8)
    }

    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(8)
    }


    data.forEach(function(d) {
        d.Date = parseTime(d.Time);
        d[bus_phase]= +d[bus_phase]
    });

    //define the voltage value line 
    var voltage_valueline = d3.line()
        .x(function(d) { return x(d.Time); })
        .y(function(d) { return y(d[bus_phase]); });

    // Scale the range of the data
    x.domain([d3.min(data, function(d) {
        return d.Time}),d3.max(data, function(d) {
        return d.Time})]);

    y.domain([d3.min(data, function(d) {
        return d[bus_phase]}),d3.max(data, function(d) {
        return d[bus_phase]})]);

    // Add the voltage_valueline path.
    voltage_svg.append("path")
        .data([data])
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("d", voltage_valueline);

    // Add the X Axis
    voltage_svg.append("g")
        .attr("transform", "translate(0," + lineheight + ")")
        .call(d3.axisBottom(x));
    
    // Add X Axis label
    voltage_svg.append("text")
        .attr("transform", "translate(" + (247) + "," + (335) + ")")
        .style("font-size", 18)
        .style("font-weight", 500)
        .style("font-family","sans-serif")
        .style("fill","grey")
        .text("Time(seconds)");
    
    // Add the Y Axis
    voltage_svg.append("g")
        .call(d3.axisLeft(y));
    
    // Add Y Axis label
    voltage_svg.append("text")
          .attr("transform", "translate(" + (-55) + "," + (150) + ")rotate(-90)")
          .style("text-anchor", "middle")
          .style("font-size", 18)
          .style("font-weight", 500)
          .style("font-family","sans-serif")
          .style("fill","grey")
          .text(phase+" Voltage");

    // Add line chartlabels
    voltage_svg.append("text")
        .attr("transform", "translate(" + (167) + "," + (-10) + ")")
        .style("font-size", 18)
        .style("font-weight", 500)
        .style("font-family","sans-serif")
        .style("fill","grey")
        .text("Voltage Data Window During Time");
        
    // add the X gridlines
    voltage_svg.append("g")			
        .attr("class", "grid")
        .style("stroke-dasharray",("3,3"))
        .attr("transform", "translate(0," + lineheight + ")")
        .call(make_x_gridlines()
            .tickSize(-lineheight)
            .tickFormat("")
    )

    // add the Y gridlines
    voltage_svg.append("g")			
        .attr("class", "grid")
        .style("stroke-dasharray",("3,3"))
        .call(make_y_gridlines()
            .tickSize(-linewidth)
            .tickFormat("")
        )

    //add tooltip
    var bisectDate = d3.bisector(function(d) { return d.Time; }).left;
    var formatValue = d3.format(",");

    var focus = voltage_svg.append("g")
            .attr("class", "focus")
            .style("display", "none")

    focus.append("circle")
            .attr("r", 5);
            focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 160)
            .attr("height", 65)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);   
    
    focus.append("text")
            .attr("x", 12)
            .attr("y", 38)
            .attr("font-weight","bold")
            .text(d3.select("#busname").node().value);
     
    focus.append("text")
            .attr("class", "tooltip-phase")
            .attr("x", 25)
            .attr("y", -2);   

    focus.append("text")
            .attr("x", 12)
            .attr("y", 18)
            .text("Seconds:");

    focus.append("text")
            .attr("x", 12)
            .attr("y", -2)
            .text("V:");

    focus.append("text")
            .attr("class", "tooltip-time")
            .attr("x", 70)
            .attr("y", 18);

    voltage_svg.append("rect")
            .attr("class", "overlay")
            .attr("width", linewidth)
            .attr("height", lineheight)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.Time > d1.Time - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.Time) + "," + y(d[bus_phase]) + ")");
        focus.select(".tooltip-time").text(formatValue(d.Time));
        focus.select(".tooltip-phase").text(formatValue(d[bus_phase]));
            }

    };