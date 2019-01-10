function loadheatmap(countrybyname, geojson){

var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Total Medals: </strong><span class='details'>" + format(d.value) +"</span>";
            })

var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 672 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

var hue = d3.scaleLinear()
    .domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
    .range([0.1, 1])
var path = d3.geoPath();

var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

var projection = d3.geoMercator()
                   .scale(100)
                  .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  svg.call(tip);
      console.log(Object.keys(countrybyname))
    geojson.features.forEach(function(d) {
      console.log(d.properties.name)
        d.value = countrybyname[d.properties.name]
        countrybyname[d.properties.name] = 0
    });
    console.log("--------------------")
  Object.keys(countrybyname).forEach(function(d){
    if (countrybyname[d] != 0)
    {
    console.log(d)
    }

  })

  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(geojson.features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", "blue")
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
      .style("opacity", function(d) {
        if (d.value != undefined)
        {
          return hue(d.value)
        }
        return 0
      })
      // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)

            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)

            .style("stroke","white")
            .style("stroke-width",0.3);
        });

  svg.append("path")
      .datum(topojson.mesh(geojson.features, function(a, b) { return a.id !== b.id; }))
      //.datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);

}


function loadline()
{

  d3.select("body").append("svg").style("top", 400)
    .attr("width", 1000).attr("height", 300).append("text").text("line chart here").attr("x", 40).attr("y", 40).style("font-size", "30px")
}

function loadbar()
{
  newsvg = d3.select("body").append("svg").attr("class", "barchart")
      .attr("width", 600).attr("height", 300);
  newsvg.append("rect").attr("width", 800).attr("height", 500).style("stroke", "blue").style("fill", "white");
  newsvg.append("text").text("A NICE (STACKED) BAR CHART HERE").attr("x", 200).attr("y", 200);
  d3.select("body").append("select").attr("class", "select").append("option").text("AXISOPTIONS")
  d3.select("body").append("select").attr("class", "select").append("option").text("SPORT")
  d3.select("body").append("a").attr("class", "text").attr("href", "pages/aboutme.html").text("about me")
  d3.select("body").append("a").attr("class", "text").attr("href", "pages/aboutdata.html").text("about data")
}

 window.onload = function load()
 {
   dataHandler()
 }

 function dataHandler(parameter)
 {
   promises = [d3.json("world_countries.json"), d3.json("output.json")]
   Promise.all(promises).then(function(values){
     // currentvalues = calculatevalues(values)

     geojson = values[0]
     data = values[1]
    datalist =  calculatevalues(data, "all")
    console.log(geojson)
    loadheatmap(datalist, geojson)
    loadbar()
    loadline()
   });
 }

 function calculatevalues(data, parameter)
{
  console.log(data)
  heatmapobject = {};
 Object.keys(data).forEach(function(country)
 {
   counter = 0
   Object.keys(data[country]).forEach(function(game)
   {
     Object.keys(data[country][game]).forEach(function(medal)
     {
       Object.keys(data[country][game][medal]).forEach(function(sport)
       {
         counter += parseInt(data[country][game][medal][sport])

       })
     })
   })
   heatmapobject[country] = counter
 })
 return heatmapobject
}
