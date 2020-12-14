function fft_draw(data){
    fft_svg.selectAll('*').remove();
    // parse the date / time
    var parseTime = d3.timeParse("%Y");
    var phase=d3.select("#phase").node().value;
    var fft_data=data['fft'];
    // set the ranges
    var x = d3.scaleLinear().range([0, linewidth]);
    var y = d3.scaleLinear().range([lineheight, 0]);

     // Scale the range of the data
    //  var freq=fft_data[Buses[0]][phase]
    //  x.domain([d3.min(freq, function(d) {
    //     return d.Freq}),d3.max(freq, function(d) {
    //     return d.Freq})]);

    var ph=[" Va"," Vb"," Vc"]
    var freq_value=[]
    for (var i=0;i<Buses.length;i++){
        for (var j=0;j<ph.length;j++){
            min=d3.min(fft_data[Buses[i]][ph[j]], function(d) { return d.Freq; })
            max=d3.max(fft_data[Buses[i]][ph[j]], function(d) { return d.Freq; })
            freq_value.push(min)
            freq_value.push(max)
        }
    }
    var freq_min = d3.min(freq_value, function(d) { return d; });
    var freq_max = d3.max(freq_value, function(d) { return d; });
    
    x.domain([freq_min,freq_max]);
    

    //create array to save all fft values
    var ph=[" Va"," Vb"," Vc"]
    var fft_value=[]
    for (var i=0;i<Buses.length;i++){
        for (var j=0;j<ph.length;j++){
            min=d3.min(fft_data[Buses[i]][ph[j]], function(d) { return d.value; })
            max=d3.max(fft_data[Buses[i]][ph[j]], function(d) { return d.value; })
            fft_value.push(min)
            fft_value.push(max)
        }
    }
    var fft_min = d3.min(fft_value, function(d) { return d; });
    var fft_max = d3.max(fft_value, function(d) { return d; });
    
    y.domain([fft_min,fft_max]);

    // Add the X Axis
    fft_svg .append("g")
        .attr("transform", "translate(0," + lineheight + ")")
        .call(d3.axisBottom(x));
    
    // Add X Axis label
    fft_svg.append("text")
        .attr("transform", "translate(" + (247) + "," + (335) + ")")
        .style("font-size", 18)
        .style("font-weight", 500)
        .style("font-family","sans-serif")
        .style("fill","grey")
        .text("Frequency(Hz)");
    
    // Add the Y Axis
    fft_svg.append("g")
    .call(d3.axisLeft(y));
    
    // Add Y Axis label
    fft_svg .append("text")
          .attr("transform", "translate(" + (-45) + "," + (150) + ")rotate(-90)")
          .style("text-anchor", "middle")
          .style("font-size", 18)
          .style("font-weight", 500)
          .style("font-family","sans-serif")
          .style("fill","grey")
          .text("|Y(f)|");

    //Add line chartlabels
    fft_svg .append("text")
        .attr("transform", "translate(" + (167) + "," + (-10) + ")")
        .style("font-size", 18)
        .style("font-weight", 500)
        .style("font-family","sans-serif")
        .style("fill","grey")
        .text("Singl-Sided Amplitude Spectrum of y(t)");
    
    
    for (var i=0;i<Buses.length;i++){
        var busname=Buses[i];
        var draw_data=fft_data[Buses[i]][phase];

        //define the fft value line
        var fft_valueline = d3.line()
            .x(function(d) { return x(d.Freq); })
            .y(function(d) { return y(d.value); })

        draw_data.forEach(function(d) {
            d.Date = parseTime(d.Freq);
            d.value= +d.value
        });

        var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

        
        var color= "hsl(" + Math.random() * 360 + ",100%,50%)"
        // Add the fft_valueline path.

        fft_svg.append("path")
            .attr("fill", "None")
            .attr("stroke-width", 3)
            .attr("opacity",0.6)
            .attr("id",Buses[i])  
            .attr("stroke",color)    
            .data([draw_data])
            .attr("class", "line")
            .attr("d", fft_valueline)
            .on("mouseover", function(d) {
                div.transition()
                  .duration(200)
                  .style("opacity", .9);
                div.html(d3.select(this).attr("id"))
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
                })
              .on("mouseout", function(d) {
                div.transition()
                  .duration(500)
                  .style("opacity", 0);
                }); 
        
        // // add label
        // fft_svg.append("text")
        //     .attr("transform", "translate("+(linewidth+10)+","+y(draw_data[0].value)+")")
        //     .attr("dy", ".7em")
        //     .attr("text-anchor", "start")
        //     .style("fill", color)
        //     .text(Buses[i]);

    
    };
    
}