var data;
function graphDraw(neighbors){
    data = neighbors
    graph_svg.selectAll("*").remove();
    var graphWidth = 200
    var graphHeight = 150
    neighbors = neighbors['result']
    selected = neighbors[0]
    lines = []
    for(var i =1; i < neighbors.length; i++){
        lines.push(neighbors[i])
    }
    var min1 = d3.min(neighbors,function(d){return (d['x'])});
    var max1 = d3.max(neighbors,function(d){return (d['x'])});
    var min2 = d3.min(neighbors, function(d){return (d['y'])});
    var max2 = d3.max(neighbors,function(d){return d['y']});
    var xScale = d3.scaleLinear()
      .domain([min1, max1])
      .range([20,graphWidth-20]);
    var yScale = d3.scaleLinear()
      .domain([min2, max2])
      .range([graphHeight-10,10]);
    graph_svg.selectAll("g").select('circle')
        .data(neighbors)
        .enter().append('circle')
        .attr("r",function(d){return getRadius(d)})
        .attr('id',function(d){return ("cirlce-Bus_" + d['name'].split(' ').join('_'))})
        .attr("cx",function(d){return xScale(d['x'])})
        .attr("cy",function(d){return yScale(d['y'])})
        .attr("stroke",function(d){return getColor(d)})
        .attr("fill",function(d){return getColor(d)})
        .on('click',function(d){clickCircle(d)})
    graph_svg.selectAll("g").select('line')
        .data(lines)
        .enter().append('line')
        .attr('x1',xScale(selected['x']))
        .attr('y1',yScale(selected['y']))
        .attr('x2',function(d){return xScale(d['x'])})
        .attr('y2',function(d){return yScale(d['y'])})
        .attr('stroke','black')
        .style('stroke-width',"0.1px")
    
  
}
function getColor(selection){
    currentBus = d3.select("#busname").property("value")
    if("Bus " + selection['name'] == currentBus){
        return "red"
    }
    else{
        return "black"
    }
}
function getRadius(selection){
    currentBus = d3.select("#busname").property("value")
    if("Bus " + selection['name'] == currentBus){
        return 4
    }
    else{
        return 2
    }
}
function clickCircle(selection){
    busInput = d3.select("#busname")
    busInput.property("value","Bus " + selection['name'])
    graphDraw(data)
    drawChart();
}