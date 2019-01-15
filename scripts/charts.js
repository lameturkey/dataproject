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
    geojson.features.forEach(function(d) {
        d.value = countrybyname[d.properties.name]
    });

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
        })
        .on("click", function(d){
          name = d.properties.name;
          object = {}
          object[name] = countrybyname[name]
          if(object[name] != undefined)
          {
          window.updatebar(object)
          var data = window.requestdata(name)
          console.log(data)
          window.updateline([name, data])
          }
        });

  svg.append("path")
      .datum(topojson.mesh(geojson.features, function(a, b) { return a.id !== b.id; }))
      //.datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);

}


function loadline()
{
  var yearsmaxvalue = 0
  var lineheight = 300
  var linewidth = 1500
  var lines = []
  var countrylist = []
  var padding = {
    left: 30,
    right: 1,
    up: 1,
    down: 30
  }
  d3.select("body").append("svg").style("top", 380).style("position", "relative").attr("class", "linechart")
    .attr("width", linewidth).attr("height", lineheight).append("text").text("line chart here").attr("x", 40).attr("y", 40).style("font-size", "30px")
  linesvg = d3.select(".linechart")

  var xscale = d3.scaleLinear()
              .range([padding.left, linewidth - padding.right])
              .domain([])
  var yscale = d3.scaleLinear()
              .range([lineheight - padding.down, padding.up])
              .domain([])
  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)



  linesvg.append("g").attr("class", "linexaxis")
                    .call(xaxis).attr("transform", "translate(0," + (lineheight - padding.down) + ")");
  linesvg.append("g").attr("class", "lineyaxis")
                    .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)")
      window.removeline = function removeline(country)
                    {
                      var index = countrylist.indexOf(country);
                      countrylist.splice(index, 1);
                      lines.splice(index, 1);
                      window.updateline()
                    }


  return function(object)
  {
    if (object != undefined)
    {
      name = object[0]
      object = object[1]

      if(countrylist.includes(name))
      {
        return
      }

      maxvalue = Math.max.apply(null, Object.values(data))
      if (maxvalue > yearsmaxvalue)
      {
        yearsmaxvalue = maxvalue
      }
      var array1 = Object.keys(object)
      var array2 = array1.map(function(d){
        newobject = {}
        newobject["medals"] = object[d]
        newobject["year"] = parseInt(d)
        return newobject
      })
      lines.push(array2)
      countrylist.push(name)
    }

    allmedals = []
    allyears = []
    lines.forEach(function(array){
      allyears = allyears.concat(array.map(function(objectpoint){
        return objectpoint.year
      }))
      allmedals = allmedals.concat(array.map(function(objectpoint){
        return objectpoint.medals
      }))
    })

    var xscale = d3.scaleLinear()
                .range([padding.left, linewidth - padding.right])
                  .domain([Math.min.apply(null, allyears), Math.max.apply(null, allyears)])
    var yscale = d3.scaleLinear()
                .range([lineheight - padding.down, padding.up])
                .domain([Math.min.apply(null, allmedals), Math.max.apply(null, allmedals)])
    var xaxis =  d3.axisBottom().scale(xscale)
    var yaxis = d3.axisLeft().scale(yscale)

    line = d3.line().x(function(d){return xscale(d.year)})
                    .y(function(d){return yscale(d.medals)})

    d3.select(".linexaxis").transition().call(xaxis)
    d3.select(".lineyaxis").transition().call(yaxis)

    currentlines = linesvg.selectAll(".line").data(lines)



    currentlines.enter().append("path").merge(currentlines)
      .attr("class", "line")
      .attr("d", line)

    currentlines.exit().remove()



}
}

function loadbar(dataobject)
{
  var barwidth = 500
  var barheight = 350
  var padding = {
    left: 35,
    up: 5,
    down: 20,
    right: 1
  }
  var data = {}
  var newsvg = d3.select("body").append("svg").attr("class", "barchart")
      .attr("width", 500).attr("height", 350);
  var xscale = d3.scaleOrdinal()
              .range([padding.left, barwidth - padding.right])
  var yscale = d3.scaleLinear()
              .range([barheight - padding.down, padding.up])

  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)

  newsvg.append("g").attr("class", "barxaxis")
                    .call(xaxis).attr("transform", "translate(0," + (barheight - padding.down) + ")");
  newsvg.append("g").attr("class", "baryaxis")
                    .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)")

  newsvg.append("text").text("A NICE (STACKED) BAR CHART HERE").attr("x", 200).attr("y", 200);
  d3.select("body").append("select").attr("class", "select").append("option").text("AXISOPTIONS")
  d3.select("body").append("select").attr("class", "select").append("option").text("SPORT")
  d3.select("body").append("a").attr("class", "text").attr("href", "pages/aboutme.html").text("about me")
  d3.select("body").append("a").attr("class", "text").attr("href", "pages/aboutdata.html").text("about data")

  function removepoint(country)
  {
    delete data[country];
    updatebar({})
  }

  return function (datapoint)
  {
    if (Object.keys(datapoint).length != 0)
    {
      data[Object.keys(datapoint)[0]] = Object.values(datapoint)[0]
    }
    xscale = d3.scaleBand()
                .domain(Object.keys(data))
                .range([padding.left, barwidth - padding.right])
                .padding(0.02)

    yscale = d3.scaleLinear()
                .domain([0, Math.max.apply(null, Object.values(data))])
                .range([barheight - padding.down, padding.up])
                .nice()


    xaxis =  d3.axisBottom().scale(xscale)
    yaxis = d3.axisLeft().scale(yscale)

    d3.select(".barxaxis").transition().call(xaxis)
    d3.select('.baryaxis').transition().call(yaxis)
    bars = newsvg.selectAll("rect").data(Object.keys(data))
    bars
      .enter().append("rect").merge(bars)
      .style("fill", "red")
      .attr("x", function(d) { return xscale(d); })
      .attr("width", xscale.bandwidth())
      .attr("y", function(d) { return yscale(data[d])})
      .attr("height", function(d) { return barheight - padding.down - yscale(data[d]); })
      .on("click", function(d)
      {
        removepoint(d)
        window.removeline(d)
      });

    bars.exit().remove()

  }
}

 window.onload = function load()
 {
   dataHandler()
 }

 function dataHandler()
 {
   promises = [d3.json("world_countries.json"), d3.json("output.json")]
   Promise.all(promises).then(function(values)
   {

    geojson = values[0]
    data = values[1]
    datalist =  calculatevalues(data, ["", "", "", ""], "bar")
    loadheatmap(datalist, geojson)
    updatebar = loadbar()
    window.barupdate = updatebar
    window.updateline = loadline()
    window.requestdata = function(country)
    {
      console.log(country)
        return calculatevalues(data, [country, "", "", ""], "line")
    }
    //
    // window.updateline(["Australia", calculatevalues(data, ["Australia", "", "", ""], "line")])
    // window.updateline(["USA", calculatevalues(data, ["USA", "", "", ""], "line")])
   });
 }

// calculates the (filtered) values for all graphs
function calculatevalues(data, parameters, graph)
{
  parameters[1] = parameters[1].split(" ")[0]
  object = {};
 Object.keys(data).forEach(function(country)
 {
   counter = 0
   if (parameters[0] === "" || parameters[0] === country)
   {
     Object.keys(data[country]).forEach(function(game)
     {
       if (parameters[1] === "" || parameters[1] === game.split(" ")[0])
       {
         Object.keys(data[country][game]).forEach(function(medal)
         {
           if (parameters[2] === "" || parameters[2] === medal)
           {
           Object.keys(data[country][game][medal]).forEach(function(sport)
           {
             if (parameters[3] === "" || parameters[3] === sport)
             {
              counter += parseInt(data[country][game][medal][sport])
              }

           })
         }
         })
       }
       if (graph === "line")
       {
          object[game.split(" ")[0]] = counter
          counter = 0
       }
     })
    }
  if (counter != 0)
  {
   object[country] = counter
  }
 })
 return object
}
