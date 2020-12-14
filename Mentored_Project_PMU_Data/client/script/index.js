var svg
var focus = 0
var st=[[1,,],[3.1,-1450,-950],[3,-1550,-525],[2.15,-200,-270],[2.85,-970,-100],[2,-575,-105],[2.8,-900,-1105],[2.8,-1030,-862],[2,-350,-340]]
var regions=[[],[],[],[],[],[],[],[]]
var lines=[[],[],[],[],[],[],[],[]]

document.addEventListener("DOMContentLoaded",
    function()
    {
        svg = d3.select('#map');
        focusInput = d3.select("#focus-select").on("change", function(){zoom()});

        // REPLACE WITH FLASK FETCHES LATER, USE LOCAL DATA FOR STABILITY
        Promise.all([d3.csv("lpData/REGIONS.csv"),d3.csv("lpData/ZONES.csv"),d3.csv("lpData/BUSES.csv"),d3.csv("lpData/LINES.csv"),d3.json("lpData/tx.geojson")]).then
        (
            function(values)
            {
                for(i=0;i<values[3].length;i++)
                {
                    fBus=values[3][i].from
                    tBus=values[3][i].to
                    fIndex=values[1][values[2][fBus-1].zone-1].region-1
                    tIndex=values[1][values[2][tBus-1].zone-1].region-1
                    if(fIndex == tIndex)
                    {
                        lines[fIndex].push(i+1)
                    }
                    else
                    {
                        lines[fIndex].push(i+1)
                        lines[tIndex].push(i+1)
                    }
                    if(!regions[fIndex].includes(fBus))
                    {
                        regions[fIndex].push(fBus)
                    }
                    if(!regions[fIndex].includes(tBus))
                    {
                        regions[fIndex].push(tBus)
                    }
                    if(!regions[tIndex].includes(tBus))
                    {
                        regions[tIndex].push(tBus)
                    }
                    if(!regions[tIndex].includes(fBus))
                    {
                        regions[tIndex].push(fBus)
                    }
                }

                var colorScale = d3.schemeCategory10
                var projection = d3.geoMercator().center([-99.43,31.47]).scale(2800).translate([450,305]);
                var geoGenerator = d3.geoPath().projection(projection);
                var u = svg.selectAll('path').data(values[4].features);
                u.enter().append('path').attr('d', geoGenerator).attr("fill","white").attr("stroke","black").attr("stroke-width", "0.5px");

                for(i=0;i<lines.length;i++)
                {
                    svg.selectAll("g").select("line")
                        .data(lines[i])
                        .enter().append("line")
                        .attr("x1", function(d){return (projection([values[2][values[3][d-1].from-1].x,values[2][values[3][d-1].from-1].y]))[0]})
                        .attr("y1", function(d){return (projection([values[2][values[3][d-1].from-1].x,values[2][values[3][d-1].from-1].y]))[1]})
                        .attr("x2", function(d){return (projection([values[2][values[3][d-1].to-1].x,values[2][values[3][d-1].to-1].y]))[0]})
                        .attr("y2", function(d){return (projection([values[2][values[3][d-1].to-1].x,values[2][values[3][d-1].to-1].y]))[1]})
                        .attr("class", "l"+String(i+1))
                        .attr("stroke","black")
                        .style('stroke-width',"0.1px")
                }

                for(i=0;i<regions.length;i++)
                {
                    svg.selectAll("g").select("circle")
                        .data(regions[i])
                        .enter().append("circle")
                        .attr("r", 2)
                        .attr("cx", function(d) {return (projection([values[2][d-1].x,values[2][d-1].y]))[0]})
                        .attr("cy", function(d) {return (projection([values[2][d-1].x,values[2][d-1].y]))[1]})
                        .attr("fill", function(d) {return colorScale[values[1][values[2][d-1].zone-1].region-1]})
                        .attr("class", "r"+String(i+1))
                        .attr("stroke","black")
                        .attr("stroke-width", "0.5px")
                        .on('mouseover', function(d)
                    {
                        d3.select(this)
                            .attr("r", 6)
                            .style("stroke-width", 1.5)
                        d3.select("#bText").text(values[2][d-1].name)
                        d3.select("#rText").text(values[0][values[1][values[2][d-1].zone-1].region-1].region).style("color", colorScale[values[1][values[2][d-1].zone-1].region-1])
                        d3.select("#zText").text(values[1][values[2][d-1].zone-1].zone)
                    })
                    .on('mousemove', function(d)
                    {

                    })
                    .on('mouseleave', function(d)
                    {
                        d3.select("#bText").text("\u00A0")
                        d3.select("#rText").text("\u00A0")
                        d3.select("#zText").text("\u00A0")
                        d3.select(this)
                            .attr("r", 2)
                            .style("stroke-width", "0.5px")
                    })
                    .on('click', function(d)
                    {
                      location.href = "chart.html";
                      localStorage.setItem("bus_name",values[2][d-1].name);
                    })
                }
                focusInput.property("value","0")
            }
        )
    }
)

function zoom()
{
    focus=focusInput.node().value;
    if(focus == 0)
    {
        d3.selectAll("circle").attr("r",2)
        d3.selectAll("line").style('stroke-width',"0.1px")
    }
    else
    {
        d3.selectAll("circle").attr("r",0)
        d3.selectAll("line").style('stroke-width',"0px")
        d3.selectAll(".r"+String(focus)).attr("r",2)
        d3.selectAll(".l"+String(focus)).style('stroke-width',"0.1px")
    }
    svg.selectAll(["circle","path","line"]).attr("transform", "translate("+st[focus][1]+","+st[focus][2]+"),scale("+st[focus][0]+")")
}
